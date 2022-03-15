import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import BuyerSellerPanel from './components/BuyerSellerPanel'
import { Navbar, Container } from 'react-bootstrap';



function App() {
  return (
    <div className="App" style={{backgroundColor: '#0d1117', height: '130vh'}}>
      
      {/* nav bar */}
      <Navbar bg="dark" variant="dark">
        <Container style={{display: "block"}}>
          <Navbar.Brand href="#home">
            <img src="https://moonbase.moonscan.io/images/logo.svg?v=22.2.4.0" style={{maxWidth: "200px", margin: "auto"}} alt="logo"/>
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* smart contract interface */}
      <BuyerSellerPanel />
    </div>
  );
}

export default App;
