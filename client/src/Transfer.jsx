import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    //Firma
    const amount = parseInt(sendAmount);
    const msg = `Pago de ${amount} para:${recipient}`;
    const bytes = utf8ToBytes(msg);
    const msgHash = toHex(bytes);

    const signature = secp256k1.sign(msgHash, privateKey);

    const signatureToString = {
      r: signature.r.toString(),
      s: signature.s.toString(),
      recovery: signature.recovery,
    };
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        recipient,
        amount,
        signature: signatureToString,
        owner: privateKey,
      });
      setBalance(balance);
      alert("Transferencia realizada");
    } catch (ex) {
      console.log("joder tio aun no se logra:", ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Enviar transacción</h1>

      <label>
        Monto a enviar
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Receptor
        <input
          placeholder="Escribe una address, por ejemplo: 3fcc0f3fe0f0d0c25884"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
