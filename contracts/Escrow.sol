// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

// tokens are transfered to escrow contract from users
// the escrow holds funds until certain condition is met
// the seller and buyer should both agree on the transaction
// one party should not able to default the transaction at the expense of other parties


contract Escrow {

    // buyer and seller address
    address payable public Buyer;
    address payable public Seller;


    // documnets who deposited how much tokens
    mapping(address => uint) Vault;


    // state enum of the transaction
    enum State {
        waiting_for_payment, //1//
        waiting_for_delivery,//2//
        transaction_complete //3//
    }


    // current state
    State public CurrentState;


    // constructor takes buyer seller address
    constructor(address payable _buyer, address payable _seller) {
        
        // set addresses
        Buyer = _buyer;
        Seller = _seller;

        // set current state to state 1
        CurrentState = State.waiting_for_payment;
    }




    // must be in certain state modifier
    modifier InState(State s){
        require(CurrentState == s, "Error, current state not valid");
        _;
    }

    // caller must be seller 
    modifier MustBeSeller(){
        require(msg.sender == Seller, "Error, only seller can do that");
        _;
    }

    // caller must be buyer
    modifier MustBeBuyer(){
        require(msg.sender == Seller, "Error, only buyer can do that");
        _;
    }



    function GetCurrState() public view returns(uint256) {
        // return CurrentState;
    }


    // returns contract balance
    function GetBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // buyer makes payment to the escrow contract
    function MakePayment() MustBeBuyer InState(State.waiting_for_payment) public payable returns(uint256){

        // returns the amount deposited
        return address(this).balance;
    }


    // seller confirm shipping
    function ConfirmShipping() MustBeSeller InState(State.waiting_for_payment) public {

        // go into the next state
        CurrentState = State.waiting_for_delivery;
    }


    function ConfirmReceiving() MustBeBuyer InState(State.waiting_for_delivery) public {
        
        // send the token to seller
        Seller.transfer(address(this).balance);
        
        // set state to transaction complete
        CurrentState = State.transaction_complete;
    }


    // refund function
    function Refund() MustBeSeller InState(State.transaction_complete) public {
        
        // give back the token to the buyer
        Buyer.transfer(address(this).balance);
        
        // set state back to initial state
        CurrentState = State.waiting_for_payment;

    }

}