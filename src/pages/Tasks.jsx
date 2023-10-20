import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { LoadingButton } from '@mui/lab';
import { Alert, Box, Modal, Paper, Snackbar, TextField } from '@mui/material';
import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import './Tasks.css';

const Tasks = ({ loggedDate, updateLoggedData }) => {
  const [pendingItens, setPendingItens] = useState([]);
  const [doingItens, setDoingItens] = useState([]);
  const [doneItens, setDoneItens] = useState([])
  const [data, setData] = useState(null)
  const [openModalCreateTask, setOpenModalCreateTask] = useState(false);
  const handleOpen = () => setOpenModalCreateTask(true);
  const handleClose = () => {
    setOpenModalCreateTask(false);
    setOpenModalViwerTask(false)
  }
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
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    'overflow': 'scroll',
    zIndex: '999'
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
        setPendingItens([...pendingItens, response.data.itemCreated[0]]);
        handleClose()
        setLoadingButton(false)
        setOpenSucessModal(true)
      })
      .catch((error) => {
        console.error('Erro:', error);
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
        setDoneItens(doneItens.filter((i) => i !== task));
        handleClose()
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
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
          setPendingItens(pendingList)
          setDoingItens(doingList)
          setDoneItens(doneList)
        })
        .catch((error) => {
          console.error('Erro:', error);
          setOpenErrorModal(true)
        });
    }
  }, [data]);

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
        setPendingItens(pendingItens.filter((i) => i !== item));
        setDoingItens([...doingItens, item]);
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
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
        setDoingItens(doingItens.filter((i) => i !== item));
        setPendingItens([...pendingItens, item]);
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
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
        setDoingItens(doingItens.filter((i) => i !== item))
        setDoneItens([...doneItens, item]);
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
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
        setDoneItens(doneItens.filter((i) => i !== item))
        setDoingItens([...doingItens, item])
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
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
    const mes = data.getMonth() + 1; // Os meses começam em 0 (janeiro é 0)
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
        <div style={{ 'display': 'flex', 'justify-content': 'space-between' }}>
          <LoadingButton
            style={{ 'margin-left': '20px' }}
            loading={loadingButton}
            color='primary'
            variant="contained"
            onClick={handleOpen}
          >
            Adicionar Task
          </LoadingButton >
          <LoadingButton
            style={{ 'margin-right': '26px' }}
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
                  <Field style={{ margin: '10px' }} type="text" name="title" label="Titulo" as={TextField} />
                  <ErrorMessage style={{ 'margin-left': '10px', 'color': 'red' }} name="title" component="div" />
                  <Field
                    style={{ margin: '10px' }}
                    type="text"
                    name="description"
                    label="Description"
                    placeholder="Descrição"
                    as={TextField}
                    multiline
                  />
                  <LoadingButton style={{ margin: '10px' }} loading={loadingButton} type="submit" variant="contained" color="primary">Criar Task</LoadingButton>
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
              <h2>Titulo</h2>
              <p>{taskModal.title}</p>
              <h3>Descrição</h3>
              <p>{taskModal.descrition != null ? taskModal.description : 'Sem descrição cadastrada'}</p>
              <dvi style={{ display: 'flex', 'flex-direction': 'row', 'align-items': 'center' }}>
                <h4>Data da criação:</h4>
                <span style={{ 'margin': '0 0 0 5px' }}>{handleData(taskModal.created_at)}</span>
              </dvi>
            </div>
          </Box>
        </Modal>

        <div className='home'>
          <Paper className='Paper' elevation={3}>
            <div className='headerPaper'>
              <h2>
                A iniciar ({pendingItens.length})
              </h2>
            </div>
            <ul>
              {pendingItens.map((item, index) => (
                <li key={index}>
                  <div className='listPapers'>
                    <span className='textTitle' onClick={() => handleOpenModalViwerTask(item)} >
                      {item.title}
                    </span>
                    <LoadingButton loading={loadingButton} onClick={() => handleMoveToDoingItens(item)}><ArrowCircleRightOutlinedIcon /></LoadingButton>
                  </div>
                </li>
              ))}
            </ul>
          </Paper>
          <Paper className='Paper' elevation={3}>
            <h2>Em Andamento ({doingItens.length})</h2>
            <ul>
              {doingItens.map((item, index) => (
                <li key={index}>
                  <div className='listPapers'>
                    <span onClick={() => handleOpenModalViwerTask(item)} className='textTitle'>
                      {item.title}
                    </span>
                    <div>
                      <LoadingButton loading={loadingButton} style={{ width: '5px' }} onClick={() => handleReturnToDoItens(item)}><ArrowCircleLeftOutlinedIcon /></LoadingButton>
                      <LoadingButton loading={loadingButton} onClick={() => handleMoveToDoneItens(item)}><ArrowCircleRightOutlinedIcon /></LoadingButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Paper>
          <Paper className='Paper' elevation={3}>
            <h2>Concluidas ({doneItens.length})</h2>
            <ul>
              {doneItens.map((item, index) => (
                <li key={index}>
                  <div className='listPapers'>
                    <span onClick={() => handleOpenModalViwerTask(item)} className='textTitle'>
                      {item.title}
                    </span>
                    <LoadingButton loading={loadingButton} onClick={() => handleReturnToDoingItens(item)}><ArrowCircleLeftOutlinedIcon /></LoadingButton>
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
