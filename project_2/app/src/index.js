import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const {web3} = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.", error);
    }
  },

  setStatus: function ({message, id}) {
    const status = document.getElementById(id);
    status.innerHTML = message;
  },

  createStar: async function () {
    const {createStar} = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    await createStar(name, id).send({from: this.account});
    App.setStatus({
      message: "New Star Owner is " + this.account + ".",
      id: "status",
    });
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const {lookUptokenIdToStarInfo} = this.meta.methods;
    let {symbol} = this.meta.methods;
    let {name} = this.meta.methods;
    let id = document.getElementById("lookid").value;
    id = parseInt(id);
    // const star = await lookUptokenIdToStarInfo(id).send({from: this.account});
    let starName = await lookUptokenIdToStarInfo(id).call(); // call lookUptokenIdToStarInfo function within the contract
    let contract = await name().call();
    let sym = await symbol().call();
    if (starName.length === 0) { // if starName is zero then no name exist and therefor not owned
      App.setStatus({message: "Star not owned.", id: "status"});
      App.setStatus({message: "Star ID: ", id: "starData"});
      App.setStatus({message: "Token Name: ", id: "contract"});
      App.setStatus({message: "Token Symbol: ", id: "symbol"});
    } else { // else its owned and displayed by passing tag ID to setStatus
      App.setStatus({message: "Star owned.", id: "status"});
      App.setStatus({message: "Star ID: " + id + " is named " + starName, id: "starData"});
      App.setStatus({message: "Token Name: " + contract, id: "contract"});
      App.setStatus({message: "Token Symbol: " + sym, id: "symbol"});
    }
  }
};

window.App = App;

window.addEventListener("load", async function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"),);
  }

  App.start();
});
