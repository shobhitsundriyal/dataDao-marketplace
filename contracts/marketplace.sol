// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract data_marketplace {
    using SafeMath for uint256;

    uint256 public latestDataId = 0;
    mapping(uint256 => string) public datasetIndexerFile;
    mapping(uint256 => string) public datasetMetaDateFile;
    mapping(uint256 => address) public datasetOwner;
    mapping(uint256 => bool) public isDataUploaded;
    mapping(uint => uint256) public datasetPrice; //wei
    mapping(uint => uint256) public datasetEarning;

    mapping(address => uint256[]) createdDatasetsBy;
    mapping(address => uint256[]) purchasedDatasetsBy;

    address public marketplaceTokenAddress;
    MarketplaceToken marketplaceToken;

    address owner;
    uint256 public totalDevFee; //remove public

    constructor() {
        marketplaceToken = new MarketplaceToken();
        marketplaceTokenAddress = address(marketplaceToken);
        owner = msg.sender;
    }

    function buyDataset(uint256 _id, uint256 _amount) public payable{        
        // Mint new tokens buying a dataset
        require(_amount <= 10, "why you want so many tokens?");
        if(_amount != 10){
            require(msg.value >= datasetPrice[_id].mul(_amount).mul(2).div(10), "Pay the sample price");
        } else {
            require(msg.value >= datasetPrice[_id], "Pay the full price");
        }
        marketplaceToken.mint(msg.sender, _id, _amount, '');
        purchasedDatasetsBy[msg.sender].push(_id);
        datasetEarning[_id] = msg.value.mul(9).div(10); // 10% dev fee is on the contract
        totalDevFee += msg.value.div(10);
    }

    function shareDataset(address _to, uint256 _amount, uint256 _datasetId) public {
        // _amount of tokens
        require(datasetOwner[_datasetId] == msg.sender, "You can't share this dataset");
        purchasedDatasetsBy[_to].push(_datasetId);
        marketplaceToken.mint(_to, _datasetId, _amount, '');
    }

    function createDatasetSlot() public returns(uint256) {
        latestDataId += 1;
        datasetOwner[latestDataId] = msg.sender;
        createdDatasetsBy[msg.sender].push(latestDataId);
        return latestDataId;
    }

    function uploadData(uint256 _datasetId, uint _price, string memory _cidIndexer, string memory _cidMetadata) public {
        require(_datasetId <= latestDataId, "this dataset don't exists");
        require(datasetOwner[_datasetId] == msg.sender, "You are not allowed to upload for this dataset");
        require(isDataUploaded[_datasetId] == false, "Data already exist for this data");
        datasetIndexerFile[_datasetId] = _cidIndexer;
        datasetMetaDateFile[_datasetId] = _cidMetadata;
        isDataUploaded[_datasetId] = true;
        datasetPrice[_datasetId] = _price;
    }

    function withdrawFunds(uint _datasetId, uint256 _amount) public {
        require(msg.sender == datasetOwner[_datasetId], "You are not the owner of dataset");
        require(datasetEarning[_datasetId] >= _amount, "Not that much funds that you want to withdraw");
        payable(msg.sender).transfer(_amount);
    }

    function withdrawDevFees(uint256 _amount) public {
        require(msg.sender == owner, "You are not allowed withdraw dev fee");
        require(totalDevFee >= _amount, "Not that much funds that you want to withdraw");
        payable(msg.sender).transfer(_amount);
    }

    function getMyCreatedDatasets(address _address) public view returns(uint256[] memory) {
        return createdDatasetsBy[_address];
    }

    function getMyPurchasedDatasets(address _address) public view returns(uint256[] memory) {
        return purchasedDatasetsBy[_address];
    }

    function percentageDataAccess(uint256 _id) public view returns(uint256) {
        return marketplaceToken.balanceOf(msg.sender, _id) * 10;
    }

    // future improvements
    /*
        - dataset owner can change the price
        - accept erc20 tokens as payment
    */
   
}

contract MarketplaceToken is ERC1155, Ownable {
    constructor() ERC1155("") {}

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }
}