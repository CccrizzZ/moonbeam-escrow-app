import React, { Component } from 'react'
import { Button, Card, ListGroup, InputGroup, FormControl } from 'react-bootstrap'
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import ContractABI from './Escrow_abi.json'



// TransactionState = {
//     waiting_for_payment: "0",
//     waiting_for_delivery: "1",
//     transaction_complete: "2" 
// }




export default class BuyerSellerPanel extends Component {

    constructor(props) {
        super(props)
        
        // states
        this.state = {
            ContractAddr: "0x5e32c9fD2c23011D54a11cd967eEc7fc44114126",
            ConnectedAddr: "",
            BuyerAddr: "",
            SellerAddr: "",
            CurrState: 0,
            AmountDeposited: 0,
            Contract: null
        }

        // refs
        this.BuyerTokenInput = React.createRef()

    }

    async componentDidMount(){
        await this.Connect()
    }



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
        
        console.log(this.state.BuyerAddr)
        console.log(this.state.ConnectedAddr)
        
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

        console.log("Seller confirm received token and send the goods " + this.state.ConnectedAddr)
        
        

        // call smart contract function
        await this.state.Contract.methods.ConfirmShipping()
        .call({from: this.state.ConnectedAddr}, function(error, result){
            console.log(error)
            console.log(result)

        })
        

        // pull contract state
        this.UpdateContractStats()
    }

    Seller_Refund_Token = async () => {
        if (!this.isSeller()) return

        console.log("Seller gives buyer a refund")

        // call smart contract function
        let result = await this.state.Contract.methods.Refund().call({from: this.state.ConnectedAddr})
        console.log(result)


        // pull contract state
        this.UpdateContractStats()
    }


    // buyer confirm received goods
    Buyer_Confirm_Goods = async () => {
        if (!this.isBuyer()) return

        console.log("Buyer confirm received goods")


        // pull contract state
        this.UpdateContractStats()
    }


    Buyer_SendToken = async () => {
        
        if (!this.isBuyer()) return
        if (!this.BuyerTokenInput.current.value){
            alert("please enter token amount!")
            return
        }
        console.log(this.BuyerTokenInput.current.value)
        console.log("Buyer send tokens")
        
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

        // pull contract state
        this.UpdateContractStats()
        
    }


    UpdateContractStats = async () => {
        let buyer = await this.state.Contract.methods.Buyer().call()
        let seller = await this.state.Contract.methods.Seller().call()
        let balance = await this.state.Contract.methods.GetBalance().call()
        let state = await this.state.Contract.methods.CurrentState().call()


        console.log(buyer)
        console.log(seller)
        console.log(balance)
        console.log(state)


        this.setState({ 
            BuyerAddr: buyer.toUpperCase(),
            SellerAddr: seller.toUpperCase(),
            AmountDeposited: window.web3.utils.fromWei(balance),
            CurrState: parseInt(state)
        })


    }



    render() {
        return (
            <Card body style={{ maxWidth: "60vw", margin: "auto", marginTop: "20px", backgroundColor: "#e0c9a6"}}>
                <h1>Escrow Contract</h1>
                <p style={{color: "#333", fontSize: "20px"}}>Connected Wallet: {this.state.ConnectedAddr}</p>


                {/* contract stats */}
                <Card style={{ width: '60%', margin: 'auto', marginTop: '20px'}}>
                    <Card.Body>
                        <Card.Title>Escrow Contract</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">Smart Contract Stats</Card.Subtitle>
                        
                        {/* info from smart contract */}
                        <ListGroup >
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
