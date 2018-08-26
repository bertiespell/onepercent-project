# Library

1) The contract makes use of a library `SafeMath.sol`
    - this is brought into the other contracts through an import statement:
        ```javascript
        import "./SafeMath.sol";
        ```
    - this is then used in the contract with the `using` keyword:
        ```javascript
        using SafeMath for uint256;
        ```
2) This project also includes another example of how to bring in a library through the `ConvertLib.sol`. This is then linked to the contract which requires it in the deployment script:
    ```javascript
      deployer.link(ConvertLib, [PaymentPipe]);
    ```