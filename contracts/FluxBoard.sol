// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FluxBoard {
    uint public postCount;

    struct Post {
        uint id;
        address author;
        string content;
        uint likes;
        uint tipAmount;
        uint timestamp;
    }

    mapping(uint => Post) public posts;
    mapping(uint => mapping(address => bool)) public likedByUser; // ✅ Added this line

    event Posted(uint indexed id, address indexed author, string content, uint timestamp);
    event Liked(uint indexed id, address indexed liker);
    event Tipped(uint indexed id, address indexed tipper, uint amount);

    function post(string calldata _content) external {
        require(bytes(_content).length > 0, "Post cannot be empty");

        postCount++;
        posts[postCount] = Post({
            id: postCount,
            author: msg.sender,
            content: _content,
            likes: 0,
            tipAmount: 0,
            timestamp: block.timestamp
        });

        emit Posted(postCount, msg.sender, _content, block.timestamp);
    }

    function like(uint _id) external {
        require(_id > 0 && _id <= postCount, "Invalid post ID");
        require(!likedByUser[_id][msg.sender], "You already liked this post");

        posts[_id].likes += 1;
        likedByUser[_id][msg.sender] = true;

        emit Liked(_id, msg.sender);
    }

    function hasLiked(uint _id, address user) external view returns (bool) {
        return likedByUser[_id][user];
    }

    function tip(uint _id) external payable {
        require(_id > 0 && _id <= postCount, "Invalid post ID");
        require(msg.value > 0, "Tip must be greater than 0");

        Post storage postItem = posts[_id];
        postItem.tipAmount += msg.value;
        payable(postItem.author).transfer(msg.value);

        emit Tipped(_id, msg.sender, msg.value);
    }

    function getPost(uint _id) external view returns (
        uint id,
        address author,
        string memory content,
        uint likes,
        uint tipAmount,
        uint timestamp
    ) {
        require(_id > 0 && _id <= postCount, "Invalid post ID");

        Post storage p = posts[_id];
        return (p.id, p.author, p.content, p.likes, p.tipAmount, p.timestamp);
    }

    function getPostCount() external view returns (uint) {
        return postCount;
    }
}
