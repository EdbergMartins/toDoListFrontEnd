import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { LoadingButton } from '@mui/lab';
import { Alert, Box, Button, Modal, Paper, Snackbar, TextField } from '@mui/material';
import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import './Tasks.css';

const Tasks = ({ loggedDate, updateLoggedData }) => {
  const [list, setList] = useState({
    pendingItens: [{}],
    doingItens: [{}],
    doneItens: [{}]
  })
  const [data, setData] = useState(null)
  const [openModalCreateTask, setOpenModalCreateTask] = useState(false);
  const [editTask, setEditTask] = useState(false)
  const handleOpen = () => setOpenModalCreateTask(true);
  const handleClose = () => {
    setOpenModalCreateTask(false);
    setOpenModalViwerTask(false);
    setEditTask(false)
  }
  const [newDescription, setNewDescription] = useState('')
  const [loadingButton, setLoadingButton] = useState(false)
  const [openModalViwerTask, setOpenModalViwerTask] = useState(false);
  const [taskModal, setTaskModal] = useState({})
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const [openErrorModal, setOpenErrorModal] = useState(false)
  const [openSucessModal, setOpenSucessModal] = useState(false)
  const id = localStorage.id
  const apiLink = process.env.REACT_APP_API_URL;
  const history = useNavigate();
  useEffect(() => {
    !token ? history('/') : setLoading(false)

  }, [token, history])

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '50%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    zIndex: '999',
    borderRadius: '25px',
    overflow: 'hidden'
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('O titulo é obrigatória'),
  });

  const handleCloseErrorModal = () => {
    setOpenErrorModal(false)
  }

  const handleCloseSucessModal = () => {
    setOpenSucessModal(false)
  }

  const sendTask = (form) => {
    form['id'] = id
    axios.post(`${apiLink}/tasks`, form, {
      headers: {
        'Authorization': `${token} `,
      }
    })
      .then((response) => {
        const newList = { ...list }
        const newItem = response.data.itemCreated[0]
        newList.pendingItens.push(newItem);
        setList(newList)
        handleClose()
        setLoadingButton(false)
        setOpenSucessModal(true)
      })
      .catch((error) => {
        console.error('Erro:', error);
        if (error.response.data.message === "Token inválido") logou() 
        setLoadingButton(false)
        setOpenErrorModal(true)
      })
  }


  const deletTask = (task) => {
    const { id } = task
    setLoadingButton(true)
    axios.delete(`${apiLink}/tasks/${id}`, {
      headers: {
        'Authorization': `${token} `,
      }
    })
      .then((response) => {
        const newList = { ...list }
        const itemIndexToRemove = newList.doneItens.findIndex(item => item.id === task.id);
        if (itemIndexToRemove !== -1) {
          newList.doneItens.splice(itemIndexToRemove, 1);
          setList(newList);
        }
        handleClose()
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
        if (error.response.data.message === "Token inválido") logou()
        setLoadingButton(false)
        setOpenErrorModal(true)
      })
  }

  const editDescription = (task, description) => {
    setLoadingButton(true)
    const { id } = task
    axios.post(`${apiLink}/tasks/${description}/${id}`, {
      headers: {
        'Authorization': `${token} `,
      }
    })
      .then((response) => {
        const newList = { ...list }
        switch (task.status) {
          case "Pendente":
            newList.pendingItens.forEach(element => {
              if (element.id === id) {
                element.description = description
                setList(newList)
              }
            });
            break;

          case "Em Andamento":
            newList.doingItens.forEach(element => {
              if (element.id === id) {
                element.description = description
                setList(newList)
              }
            });
            break;

          case "Concluída":
            newList.doneItens.forEach(element => {
              if (element.id === id) {
                element.description = description
                setList(newList)
              }
            })
            break;

          default:
            break;
        }
        setEditTask(false)
        setNewDescription('')
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
        if (error.response.data.message === "Token inválido") logou() 
        setLoadingButton(false)
        setOpenErrorModal(true)
      })
  }

  useEffect(() => {
    if (data === null) {
      axios.get(`${apiLink}/tasks/${id}`, {
        headers: {
          'Authorization': `${token} `,
        },
      })
        .then((response) => {
          setData(response.data);
          const pendingList = []
          const doingList = []
          const doneList = []
          for (let i = 0; i < response.data.length; i++) {
            switch (response.data[i].status) {
              case "Pendente":
                pendingList.push(response.data[i])
                break;
              case 'Em Andamento':
                doingList.push(response.data[i])
                break;
              case 'Concluída':
                doneList.push(response.data[i])
                break;
              default:
                break;
            }
          }
          setList(
            {
              pendingItens: pendingList,
              doingItens: doingList,
              doneItens: doneList
            }
          )
        })
        .catch((error) => {
          console.error('Erro:', error);
          if (error.response.data.message === "Token inválido") logou() 
          setOpenErrorModal(true)
        });
    }
  }, [data, apiLink, id, token]);

  const handleMoveToDoingItens = (item) => {
    setLoadingButton(true)
    const newItem = item
    newItem.status = 'Em Andamento'
    axios.patch(`${apiLink}/tasks`, newItem, {
      headers: {
        'Authorization': `${token} `,
      }
    })
      .then((response) => {
        const newList = { ...list }
        const newPendingItens = newList.pendingItens.filter((i) => i !== item)
        newList.doingItens.push(item)
        newList.pendingItens = newPendingItens
        setList(newList)
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
        if (error.response.data.message === "Token inválido") logou() 
        setLoadingButton(false)
        setOpenErrorModal(true)
      })
  };

  const handleReturnToDoItens = (item) => {
    setLoadingButton(true)
    const newItem = item
    newItem.status = 'Pendente'
    axios.patch(`${apiLink}/tasks`, newItem, {
      headers: {
        'Authorization': `${token} `,
      }
    })
      .then((response) => {
        const newList = { ...list }
        const newDoingItens = newList.doingItens.filter((i) => i !== item)
        newList.pendingItens.push(item)
        newList.doingItens = newDoingItens
        setList(newList)
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
        if (error.response.data.message === "Token inválido") logou() 
        setLoadingButton(false)
        setOpenErrorModal(true)
      })
  };

  const handleMoveToDoneItens = (item) => {
    setLoadingButton(true)
    const newItem = item
    newItem.status = 'Concluída'
    axios.patch(`${apiLink}/tasks`, newItem, {
      headers: {
        'Authorization': `${token} `,
      }
    })
      .then((response) => {
        const newList = { ...list }
        const newDoingItens = newList.doingItens.filter((i) => i !== item)
        newList.doneItens.push(item)
        newList.doingItens = newDoingItens
        setList(newList)
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
        if (error.response.data.message === "Token inválido") logou() 
        setLoadingButton(false)
        setOpenErrorModal(true)
      })
  }

  const handleReturnToDoingItens = (item) => {
    setLoadingButton(true)
    const newItem = item
    newItem.status = 'Em Andamento'
    axios.patch(`${apiLink}/tasks`, newItem, {
      headers: {
        'Authorization': `${token} `,
      }
    })
      .then((response) => {
        const newList = { ...list }
        const newDoneItens = newList.doneItens.filter((i) => i !== item)
        newList.doingItens.push(item)
        newList.doneItens = newDoneItens
        setList(newList)
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
        if (error.response.data.message === "Token inválido") logou() 
        setLoadingButton(false)
        setOpenErrorModal(true)
      })
  }

  const handleOpenModalViwerTask = (task) => {
    setOpenModalViwerTask(true)
    setTaskModal(task)
  }

  const handleData = (date) => {
    const data = new Date(date)
    const dia = data.getDate();
    const mes = data.getMonth() + 1; 
    const ano = data.getFullYear();
    const horas = data.getHours();
    const minutos = data.getMinutes();
    const segundos = data.getSeconds();
    return `${horas}:${minutos}:${segundos} ${dia}/${mes}/${ano} `;
  }
  const logou = () => {
    localStorage.clear();
    window.location.href = "/";
  }

  return (

    loading ? <> </> :
      <>
        <Snackbar open={openErrorModal} autoHideDuration={1000} onClose={handleCloseErrorModal} >
          <Alert onClose={handleCloseErrorModal} severity="error" sx={{ width: '100%' }}>
            Erro ao executar a ação.
          </Alert>
        </Snackbar>
        <Snackbar open={openSucessModal} autoHideDuration={1000} onClose={handleCloseSucessModal} >
          <Alert onClose={handleCloseSucessModal} severity="success" sx={{ width: '100%' }}>
            Ação executada com seucesso.
          </Alert>
        </Snackbar>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <LoadingButton
            style={{ marginLeft: '20px' }}
            loading={loadingButton}
            color='primary'
            variant="contained"
            onClick={handleOpen}
          >
            Adicionar Task
          </LoadingButton >
          <LoadingButton
            style={{ position: 'absolute', top: '25px', right: '30px', boxShadow: 'none', backgroundColor: '#4487ca' }}
            loading={loadingButton}
            color='primary'
            variant="contained"
            onClick={logou}
          >
            Sair
          </LoadingButton >
        </div>
        <Modal
          open={openModalCreateTask}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} >
            <Formik
              initialValues={{ title: '', description: '' }}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                setLoadingButton(true)
                sendTask(values)
              }}
            >
              {formik => (
                <Form style={{ display: 'flex', flexDirection: 'column' }}>
                  <Button onClick={handleClose} style={{ position: 'absolute', right: '10px', top: '10px' }}>
                    <CloseIcon style={{ color: 'black' }} />
                  </Button>
                  <Field style={{ margin: '40px 10px 10px 10px' }} type="text" name="title" label="Titulo" as={TextField} />
                  <ErrorMessage style={{ 'margin-left': '10px', 'color': 'red' }} name="title" component="div" />
                  <Field
                    style={{ margin: '10px' }}
                    type="text"
                    name="description"
                    label="Description"
                    placeholder="Descrição"
                    as={TextField}
                    rows={4}
                    multiline
                  />
                  <LoadingButton style={{ margin: '10px', position: 'absolute', bottom: '20px', right: '30px' }} loading={loadingButton} type="submit" variant="contained" color="primary">Criar Task</LoadingButton>
                </Form>

              )}
            </Formik>
          </Box>
        </Modal>
        <Modal
          open={openModalViwerTask}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <div>
              <Button onClick={handleClose} style={{ position: 'absolute', right: '10px', top: '10px' }}>
                <CloseIcon style={{ color: 'black' }} />
              </Button>
              <h2>Titulo</h2>
              <p>{taskModal.title}</p>
              <h3>Descrição</h3>
              {!editTask ? 
              <p>{taskModal.description != null ? taskModal.description : 'Sem descrição cadastrada'}</p>
                :
                <TextField style={{ width: '100%' }}
                  multiline
                  type="text"
                  value={newDescription}
                  onChange={(e) => (setNewDescription(e.target.value))}
                  rows={2}
                  placeholder={taskModal.description}
                />
              }

              <div style={{ display: 'flex', 'flex-direction': 'row', 'align-items': 'center' }}>
                <h4>Data da criação:</h4>
                <span style={{ 'margin': '0 0 0 5px' }}>{handleData(taskModal.created_at)}</span>
              </div>
              {!editTask ?
                <LoadingButton onClick={() => setEditTask(true)} style={{ margin: '10px', position: 'absolute', bottom: '20px', right: '30px' }} loading={loadingButton} variant="contained" color="primary">Editar Task</LoadingButton>
                :
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <LoadingButton onClick={() => setEditTask(false)} style={{ margin: '10px', position: 'absolute', bottom: '20px', right: '150px' }} loading={loadingButton} type="submit" variant="contained" color="primary">Cancelar</LoadingButton>
                  <LoadingButton
                    onClick={() => editDescription(taskModal, newDescription)}
                    style={{ margin: '10px', position: 'absolute', bottom: '20px', right: '30px' }}
                    loading={loadingButton}
                    type="submit"
                    variant="contained"
                    color="primary">
                    Concluir
                  </LoadingButton>
                </div>
              }
            </div>
          </Box>
        </Modal>
        <div className='home'>
          <Paper className="Paper" elevation={3}>
            <div className="headerPaper">
              <h2>A iniciar ({list.pendingItens.length})</h2>
            </div>
            <ul>
              {list.pendingItens.map((item, index) => (
                <li key={index}>
                  <div className="listPapers">
                    <span className="textTitle" onClick={() => handleOpenModalViwerTask(item)}>
                      {item.title}
                    </span>
                    <LoadingButton loading={loadingButton} onClick={() => handleMoveToDoingItens(item)}>
                      <ArrowCircleRightOutlinedIcon />
                    </LoadingButton>
                  </div>
                </li>
              ))}
            </ul>
          </Paper>
          <Paper className="Paper" elevation={3}>
            <h2>Em Andamento ({list.doingItens.length})</h2>
            <ul>
              {list.doingItens.map((item, index) => (
                <li key={index}>
                  <div className="listPapers">
                    <span onClick={() => handleOpenModalViwerTask(item)} className="textTitle">
                      {item.title}
                    </span>
                    <div>
                      <LoadingButton loading={loadingButton} style={{ width: '5px' }} onClick={() => handleReturnToDoItens(item)}>
                        <ArrowCircleLeftOutlinedIcon />
                      </LoadingButton>
                      <LoadingButton loading={loadingButton} onClick={() => handleMoveToDoneItens(item)}>
                        <ArrowCircleRightOutlinedIcon />
                      </LoadingButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Paper>                
          <Paper className="Paper" elevation={3}>
            <h2>Concluídas ({list.doneItens.length})</h2>
            <ul>
              {list.doneItens.map((item, index) => (
                <li key={index}>
                  <div className="listPapers">
                    <span onClick={() => handleOpenModalViwerTask(item)} className="textTitle">
                      {item.title}
                    </span>
                    <LoadingButton loading={loadingButton} onClick={() => handleReturnToDoingItens(item)}>
                      <ArrowCircleLeftOutlinedIcon />
                    </LoadingButton>
                    <LoadingButton loading={loadingButton} onClick={() => deletTask(item)}>
                      <RemoveCircleOutlineIcon />
                    </LoadingButton>
                  </div>
                </li>
              ))}
            </ul>
          </Paper>
        </div>
      </>
  );
};

export default Tasks;
