// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow{
    address public client;
    address public freelancer;
    uint public amount;
    bool public isFunded;
    bool public isCompleted;

    constructor(address _freelancer) payable {
        client = msg.sender;
        freelancer = _freelancer;
        amount = msg.value;
        isFunded = true;
    }

    modifier onlyClient() {
        require(msg.sender == client, "Only client can perform this action");
        _;
    }

    function releasePayment() public onlyClient {
        require(isFunded, "Funds not deposited");
        require(!isCompleted, "Payment already released");

        isCompleted = true;
        payable(freelancer).transfer(amount);
    }

    function refundClient() public onlyClient {
        require(isFunded, "No funds to refund");
        require(!isCompleted, "Payment already released");

        isFunded = false;
        payable(client).transfer(amount);
    }
}