import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    if (privateKey === "") {
      setAddress("");
      setBalance(0);
    }
    const publicKey = secp256k1.getPublicKey(privateKey);
    const addressHex = toHex(publicKey);
    const address = addressHex.slice(-20);
    setAddress(address);

    if (address) {
      try {
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } catch (e) {
        console.error("Error con el balance: ", e);
      }
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Tu billetera</h1>

      <label>
        Clave privada
        <input
          placeholder="Escribe la clave privada"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>
      <div>Address: {address}</div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
