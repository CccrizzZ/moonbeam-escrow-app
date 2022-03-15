// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;


contract Escrow {

    // buyer and seller address
    address payable public Buyer;
    address payable public Seller;


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
        require(msg.sender == Buyer, "Error, only buyer can do that");
        _;
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
        
        require(address(this).balance > 0, "Buyer should be paying something atleast");

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
    function Refund() MustBeSeller InState(State.waiting_for_payment) public {
        
        require(address(this).balance > 0, "Buyer should be paying something atleast");
        
        // give back the token to the buyer
        Buyer.transfer(address(this).balance);

    }

}