import GitHubIcon from '@mui/icons-material/GitHub';
import './FooterBar.css';


const FooterBar = () => {
  return (
    <>
      <div className='footer'>
        <p>
          Projeto voltado para pratica de desenvolvimento fullstack 
        </p>
        <a style={{ color: 'white' }} href="https://github.com/EdbergMartins" target="_blank" rel="noreferrer">
          <GitHubIcon />
        </a>
      </div>
    </>
  )

}

export default FooterBar