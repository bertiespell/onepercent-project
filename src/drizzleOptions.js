import ComplexStorage from './ABI/build/contracts/ComplexStorage.json'
import SimpleStorage from './ABI/build/contracts/SimpleStorage.json'
import TutorialToken from './ABI/build/contracts/TutorialToken.json'
import PayableExample from './ABI/build/contracts/PayableExample.json';
import PaymentPipe from './ABI/build/contracts/PaymentPipe.json';

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:process.env.ETHEREUM_NODE_PORT'
    }
  },
  contracts: [
    ComplexStorage,
    SimpleStorage,
    TutorialToken,
    PayableExample,
    PaymentPipe
  ],
  events: {
    SimpleStorage: ['StorageSet']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions
