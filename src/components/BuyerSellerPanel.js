import React, { Component } from 'react'
import { Button, Card, ListGroup, InputGroup, FormControl, Alert, Spinner } from 'react-bootstrap'
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import ContractABI from './Escrow_abi.json'



export default class BuyerSellerPanel extends Component {

    constructor(props) {
        super(props)
        
        // states
        this.state = {
            ContractAddr: "0x5e32c9fD2c23011D54a11cd967eEc7fc44114126",  // paste contract address here
            ConnectedAddr: "",
            BuyerAddr: "",
            SellerAddr: "",
            CurrState: 0,
            AmountDeposited: 0,
            Contract: null,
            IsLoading: false
        }

        // refs
        this.BuyerTokenInput = React.createRef()

    }

    async componentDidMount(){
        // look for metamask
        await this.Connect()
    }


    // connect to metamask
    Connect = async () => {

        // detect metamask
        console.log("Connecting to metamask...")
        const provider = await detectEthereumProvider()
        
        
        if (provider) {
            
            // save connected wallet address in state
            // console.log(provider.selectedAddress)
            this.setState({ ConnectedAddr: provider.selectedAddress.toUpperCase()  })

            // create web 3 conponent, attach to window and load contract
            window.web3 = new Web3(provider)
            let contract = new window.web3.eth.Contract(ContractABI, this.state.ContractAddr)

            // set contract to state
            this.setState({ Contract: contract })

            // update contract stats
            this.UpdateContractStats()

            return true
        } else {
            console.log('MetaMask must be installed to run this DApp.')
            return false
        }
    }




    // render contract current state
    GiveState = () => {
        switch (this.state.CurrState) {
            case 0:
                return "Waiting for payment"
            case 1:
                return "Waiting for delivery"
            case 2:
                return "Transaction Complete"
            default:
                alert("Error, State not recognized: " + this.state.CurrState)
                return false
        }
    }


    



    // return true if connected metamask addr matches buyer
    isBuyer = () => {
        if (this.state.ConnectedAddr === this.state.BuyerAddr) {
            return true
        }
        alert("Only Buyers Can Call")
        return false
        
    }

    // return true if connected metamask addr matches seller
    isSeller = () => {
        if (this.state.ConnectedAddr === this.state.SellerAddr) {
            return true
        }
        alert("Only Sellers Can Call")
        return false
    }




    // seller confirm 
    Seller_Confirm_Token = async () => {
        if (!this.isSeller()) return

        console.log("Seller confirm received token and send the goods ")

        // show the alert
        this.ToggleWaitingAlert()
  
        // call smart contract function
        let result = await this.state.Contract.methods.ConfirmShipping()
        .send({
            from: this.state.ConnectedAddr
        })
        console.log(result)

        // hide alert
        this.ToggleWaitingAlert()
        // pull contract state
        this.UpdateContractStats()
    }




    // seller refund
    Seller_Refund_Token = async () => {
        if (!this.isSeller()) return

        console.log("Seller gives buyer a refund, please wait...")
        
        // show the alert
        this.ToggleWaitingAlert()

        // call smart contract function
        let result = await this.state.Contract.methods.Refund()
        .send({
            from: this.state.ConnectedAddr
        })
        console.log(result)

        // hide alert
        this.ToggleWaitingAlert()
        // pull contract state
        this.UpdateContractStats()

    }



    // buyer send token
    Buyer_SendToken = async () => {
        
        if (!this.isBuyer()) return
        if (!this.BuyerTokenInput.current.value){
            alert("please enter token amount!")
            return
        }
        console.log(this.BuyerTokenInput.current.value)
        console.log("Buyer send tokens, please wait...")

        // show the alert
        this.ToggleWaitingAlert()


        // call smart contract function and send tokens
        let result = await this.state.Contract.methods.MakePayment()
        .send({
            from: this.state.ConnectedAddr, 
            value: window.web3.utils.toWei(this.BuyerTokenInput.current.value) // get user input value
        })
        .on('error', function(error, receipt) { 
            alert(error.message)
        })
        console.log(result)

        // hide alert
        this.ToggleWaitingAlert()
        // pull contract state
        this.UpdateContractStats()
        
        
    }

    
    
    
    // buyer confirm received goods
    Buyer_Confirm_Goods = async () => {
        if (!this.isBuyer()) return
        
        console.log("Buyer confirm received goods, please wait...")
        
        // show the alert
        this.ToggleWaitingAlert()

        // call smart contract function
        let result = await this.state.Contract.methods.ConfirmReceiving()
        .send({
            from: this.state.ConnectedAddr
        })
        console.log(result)
        
        
        // hide alert
        this.ToggleWaitingAlert()
        // pull contract state
        this.UpdateContractStats()

    }

    

    // toggle the waiting alert component 
    ToggleWaitingAlert = () => {
        this.setState({
            IsLoading: !this.state.IsLoading
        })
    }
    
    
    
    // pull info from smart contract
    UpdateContractStats = async () => {
        // show the alert
        this.ToggleWaitingAlert()

        // get info from contract
        let buyer = await this.state.Contract.methods.Buyer().call()
        let seller = await this.state.Contract.methods.Seller().call()
        let balance = await this.state.Contract.methods.GetBalance().call()
        let state = await this.state.Contract.methods.CurrentState().call()

        console.log("Contract Info Updated~~")
        // console.log(buyer)
        // console.log(seller)
        // console.log(balance)
        // console.log(state)

        // save info in state
        this.setState({ 
            BuyerAddr: buyer.toUpperCase(),
            SellerAddr: seller.toUpperCase(),
            AmountDeposited: window.web3.utils.fromWei(balance),
            CurrState: parseInt(state)
        })

        // hdie alert
        this.ToggleWaitingAlert()

    }



    render() {
        return (
            <Card body style={{ maxWidth: "60vw", margin: "auto", marginTop: "20px", backgroundColor: "#e0c9a6"}}>
                <Button style={{ fontSize: "16px"}} onClick={this.Connect}>Connected Wallet: {this.state.ConnectedAddr}</Button>
                <Alert variant="warning" style={{ marginTop: "10px" }} show={this.state.IsLoading}>
                    <Alert.Heading>Waiting for Blockchain to Execute Order......</Alert.Heading>
                    <Spinner animation="border" variant="success" />
                </Alert>

                {/* contract stats */}
                <Card style={{ width: '60%', margin: 'auto', marginTop: '20px'}}>
                    <Card.Body>
                        <Card.Title>Escrow Contract</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
                        <hr/>
                        
                        {/* info from smart contract */}
                        <ListGroup >
                            <ListGroup.Item style={{color: 'white', backgroundColor: "#9400D3"}}>📜Contract Address: {this.state.ContractAddr}</ListGroup.Item>
                            <ListGroup.Item style={{color: 'white', backgroundColor: "#00c153"}}>📥Buyer: {this.state.BuyerAddr}</ListGroup.Item>
                            <ListGroup.Item style={{color: 'white', backgroundColor: "#ff364d"}}>📤Seller: {this.state.SellerAddr}</ListGroup.Item>
                            <ListGroup.Item style={{color: 'white', backgroundColor: "#ff8d36"}}>🛠State: {this.GiveState()}</ListGroup.Item>
                            <ListGroup.Item style={{color: 'white', backgroundColor: "#364bff"}}>💰Amount Deposited: {this.state.AmountDeposited} DEV</ListGroup.Item>
                        </ListGroup>

                    </Card.Body>
                </Card>


                {/* buyer & seller interface */}
                <div style={{ display: "flex", margin: 'auto', marginTop: '20px'}}>
                    
                    {/* seller interface */}
                    <Card style={{ width: '45%', margin: 'auto' }}>
                        <Card.Body>
                            <Card.Title>Seller Interface</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Sellers Functions</Card.Subtitle>
                            <hr/>

                            {/* seller functions */}
                            <div style={{ display: 'grid', gridGap: "10px" }}>
                                <Button disabled={this.state.CurrState === 0 ? false : true} variant="success" size="lg" onClick={this.Seller_Confirm_Token}>Confirm Token Received and Ship Goods</Button>
                                <Button disabled={this.state.CurrState === 0 ? false : true} variant="success" size="lg" onClick={this.Seller_Refund_Token}>Give Buyer a Refund</Button>
                            </div>
                            
                        </Card.Body>
                    </Card>
                    
                    {/* buyer interface */}
                    <Card style={{ width: '45%', margin: 'auto' }}>
                        <Card.Body>
                            <Card.Title>Buyer Interface</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Buyers Functions</Card.Subtitle>
                            
                            {/* buyer functions */}
                            <div style={{ display: 'grid', gridGap: "10px" }}>
                                <hr/>
                                <Card.Text>This function sends token to the escrow contract, can be only called in Waiting for payment state</Card.Text>
                                <InputGroup className="mb-3">
                                    <FormControl
                                        ref={this.BuyerTokenInput}
                                        placeholder="Amount"
                                        type="number"
                                    />
                                    <InputGroup.Text id="basic-addon2">DEV</InputGroup.Text>
                                </InputGroup>
                                <Button disabled={this.state.CurrState === 0 ? false : true} variant="success" size="lg" onClick={this.Buyer_SendToken}>Send Token to Escrow</Button>
                                <hr/>
                                <Card.Text>This function will let escrow contract send buyers token to seller, can be only called in Waiting for delivery state</Card.Text>
                                <Button disabled={this.state.CurrState === 1 ? false : true} variant="success" size="lg" onClick={this.Buyer_Confirm_Goods}>Confirm Goods Received</Button>
                            </div>

                        </Card.Body>
                    </Card>
                </div>

            </Card>
        )
    }
}
