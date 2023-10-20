import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LoadingButton } from '@mui/lab';
import { Alert, Box, Button, Paper, Snackbar, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import './Home.css';

const Home = () => {
  const [loadingButton, setLoadingButton] = useState(false)
  const [loginViwer, setLoginViwer] = useState(true)
  const [open, setOpen] = useState(false)
  const [openError, setOpenError] = useState(false)
  const history = useNavigate();
  const apiLink = process.env.REACT_APP_API_URL;

  const handleClose = () => {
    setOpen(false)
  }

  const handleCloseError = () => {
    setOpenError(false)
  }

  const validationSchema = yup.object({
    email: yup
      .string('Enter your email')
      .email('Enter a valid email')
      .required('Email is required')
  });
  console.log(apiLink)
  const singIn = (form) => {
    setLoadingButton(true)
    axios.post(`${apiLink}/login`, form)
      .then((response) => {
        const novaChave = 'jwtToken';
        form[novaChave] = response.data.jwtToken
        console.log(form)
        console.log('response.data', response.data)
        localStorage.setItem('id', response.data.id)
        localStorage.setItem('token', response.data.jwtToken)
        localStorage.setItem('email', response.data.email)
        history('/tasks')
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
        setOpen(true)
        setLoadingButton(false)
      })
  }

  const singUp = (form) => {
    setLoadingButton(true)
    axios.post(`${apiLink}/register`, form)
      .then((response) => {
        response.data !== 'Usuário já cadastrado' ? singIn(form) : setOpen(true)
        setLoadingButton(false)
      })
      .catch((error) => {
        console.error('Erro:', error);
        setLoadingButton(false)
      })
  }
  return (

    loginViwer ?
      <>
        <Snackbar open={open} autoHideDuration={1000} onClose={handleClose} >
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            Credenciais incorretas!
          </Alert>
        </Snackbar>
        <Box className='pageLogin'>
          <Paper className='formLogin'>
            <Typography> Login</Typography>
          <Formik
              initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              singIn(values)
            }}
          >
            {formik => (
                <Form style={{ display: 'flex', flexDirection: 'column', alignSelf: 'center' }}>
                  <Field style={{ margin: '10px' }} type="text" name="email" label="Email" as={TextField} />
                  <ErrorMessage style={{ marginLeft: '10px', color: 'red' }} name="email" component="div" />
                <Field
                    className='passwordPlace'
                    variant='outlined'
                  style={{ margin: '10px' }}
                    type="password"
                    name="password"
                    label="Password"
                    placeholder="Password"
                  multiline
                />
                  <LoadingButton style={{ margin: '10px' }} loading={loadingButton} type="submit" variant="contained" color="primary">
                    Conectar
                  </LoadingButton>
                  <LoadingButton style={{ background: 'none', border: 'none', marginTop: '30px' }} onClick={() => setLoginViwer(false)}>
                    Criar Conta
                  </LoadingButton>
                </Form>
            )}
            </Formik>
          </Paper>
        </Box>
      </>
      :
      <>
        <Snackbar open={open} autoHideDuration={1000} onClose={handleClose} >
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            Usuário já cadastrado!
          </Alert>
        </Snackbar>
        <Snackbar open={openError} autoHideDuration={1000} onClose={handleClose} >
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            Erro ao cadastrar usuário!
          </Alert>
        </Snackbar>
        <Box className='pageLogin'>
          <Paper className='formLogin'>
            <div style={{ display: 'flex', width: '200PX', 'align-items': 'center', 'margin-bottom': '40px' }}>
              <Button>
                <ArrowBackIcon onClick={() => setLoginViwer(true)} />
              </Button>
              <Typography> Criar Conta</Typography>
            </div>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                singUp(values)
              }}
            >
              {formik => (
                <Form style={{ display: 'flex', flexDirection: 'column', alignSelf: 'center' }}>
                  <Field style={{ margin: '10px' }} type="text" name="email" label="Email" as={TextField} />
                  <ErrorMessage style={{ marginLeft: '10px', color: 'red' }} name="email" component="div" />
                  <Field
                    style={{ margin: '10px' }}
                    type="password"
                    name="password"
                    label="Password"
                    placeholder="Descrição"
                    className='passwordPlace'
                  />
                  <LoadingButton loading={loadingButton} style={{ marginTop: '30px' }} type="submit" variant="contained" color="primary" >
                    Criar
                  </LoadingButton>
                </Form>
              )}
            </Formik>
          </Paper>
        </Box >
    </>
  )
}

export default Home;