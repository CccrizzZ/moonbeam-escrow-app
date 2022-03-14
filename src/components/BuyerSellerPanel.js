import React, { Component } from 'react'
import { Button, Card, ListGroup, InputGroup, FormControl } from 'react-bootstrap';


// TransactionState = {
//     waiting_for_payment: "1",
//     waiting_for_delivery: "2",
//     transaction_complete: "3" 
// }


// this is the deployed contract address using remix
const contractAddress = ''


export default class BuyerSellerPanel extends Component {

    constructor(props) {
        super(props)
        
        // states
        this.state = {
            ConnectedAddr:"",
            BuyerAddr: "0x42d4C344628abBEEac2DBD08e23E7Ea5D4561E59",
            SellerAddr: "0x20cacBCcB5aC43A4c0E4d7b458dfcB71608c3cA6",
            CurrState: 1,
            AmountDeposited: 0
        }

        // refs
        this.BuyerTokenInput = React.createRef()

    }

    // render contract current state
    GiveState = () => {
        switch (this.state.CurrState) {
            case 1:
                return "Waiting for payment"
            case 2:
                return "Waiting for delivery"
            case 3:
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
    Seller_Confirm_Token = () => {
        if (!this.isSeller()) return

        console.log("Seller confirm received token and send the goods")
        
        // call smart contract function
        

    }


    // buyer confirm received goods
    Buyer_Confirm_Goods = async () => {
        if (!this.isBuyer()) return

        console.log("Buyer confirm received goods")

    }


    Buyer_SendToken = async () => {
        
        if (!this.isBuyer()) return
        
        console.log(this.BuyerTokenInput.current.value)
        console.log("Buyer send tokens")
        
    }






    render() {
        return (
            <Card body style={{ maxWidth: "60vw", margin: "auto", marginTop: "20px", backgroundColor: "#e0c9a6"}}>
                <h1>Escrow Contract</h1>

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
                            <ListGroup.Item style={{color: 'white', backgroundColor: "#364bff"}}>💰Amount Deposited: {this.state.AmountDeposited}</ListGroup.Item>
                        </ListGroup>

                    </Card.Body>
                </Card>


                {/* buyer & seller interface */}
                <div style={{ display: "flex", margin: 'auto', marginTop: '20px'}}>
                    
                    {/* seller interface */}
                    <Card style={{ width: '18rem', margin: 'auto' }}>
                        <Card.Body>
                            <Card.Title>Seller Interface</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Sellers Functions</Card.Subtitle>

                            {/* seller functions */}
                            <div style={{ display: 'grid', gridGap: "10px" }}>
                                <Button variant="success" size="lg" onClick={this.Seller_Confirm_Token}>Confirm Token Received and Ship Goods</Button>
                            </div>
                            
                        </Card.Body>
                    </Card>
                    
                    {/* buyer interface */}
                    <Card style={{ width: '18rem', margin: 'auto' }}>
                        <Card.Body>
                            <Card.Title>Buyer Interface</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Buyers Functions</Card.Subtitle>
                            
                            {/* buyer functions */}
                            <div style={{ display: 'grid', gridGap: "10px" }}>
                                <hr/>
                                <Card.Text>This function sends token to the escrow contract</Card.Text>
                                <InputGroup className="mb-3">
                                    <FormControl
                                        ref={this.BuyerTokenInput}
                                        placeholder="Amount"
                                        type="number"
                                    />
                                    <InputGroup.Text id="basic-addon2">DEV</InputGroup.Text>
                                </InputGroup>
                                <Button disabled={this.state.CurrState === 1 ? false : true} variant="success" size="lg" onClick={this.Buyer_SendToken}>Send Token to Escrow</Button>
                                <hr/>
                                <Card.Text>This function will let escrow contract send buyers token to seller</Card.Text>
                                <Button variant="success" size="lg" onClick={this.Buyer_Confirm_Goods}>Confirm Goods Received</Button>
                            </div>

                        </Card.Body>
                    </Card>
                </div>

            </Card>
        )
    }
}
