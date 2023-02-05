// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DataMarket is ERC1155, Ownable {

    struct Data {
        uint id;
        bytes lightHouseHash;
        bytes description;
        address owner;
        uint price;
    }
    Data[] database;
    mapping (uint => Data) idToData;
    // id to light house hash
    mapping (uint => bytes) idToHash;
    uint nftId = 0;

    constructor() ERC1155("") {}

    function uploadData(uint _price, bytes memory _description, bytes memory _hash ) external {

        Data memory data = Data({
            id: nftId,
            lightHouseHash: _hash,
            description: _description,
            owner: msg.sender,
            price: _price
        });

        database.push(data);
        idToData[id] = data;
        idToHash[id] = _hash;

        nftId++;
    }

    function buyData(uint id) external payable  {
        // check if the call includes the data price amount
        Data memory data = idToData[id];
        uint price = data.price;
        require(msg.value == price, "Invalid payment amount");
        // mint nft to the buyer
        _mint(msg.sender, id, 1, "");
    }

    function getAllDataInfo(uint start, uint count) public view returns(Data[] memory) {
        Data[] memory data = new Data[](count);
        for (uint i=0; i<count; i++) {
            data[i] = database[start +i];
        }
        return data;
    }

    function getDataInfo (uint id) public view returns(Data memory) {
        return idToData[id]; 
    }

}