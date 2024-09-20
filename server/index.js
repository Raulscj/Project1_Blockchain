const express = require("express");
const cors = require("cors");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "3b87d1d15e77c226849b": 100,
  "1d580e77bf2eb5e2cc71": 50,
  "3fcc0f3fe0f0d0c25884": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  console.log("Desde el balance: ", address);
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  try {
    const { sender, recipient, amount, owner, signature } = req.body;
    //Mensaje en común
    const msg = "Hola";
    const bytes = utf8ToBytes(msg);
    const msgHash = toHex(bytes);
    //Reconstruir el signature
    const signatureBigInt = {
      r: BigInt(signature.r),
      s: BigInt(signature.s),
      recovery: signature.recovery,
    };
    //Obtener la clave publica
    const publicKey = secp256k1.getPublicKey(owner);
    //Validar firma
    const isSigned = secp256k1.verify(signatureBigInt, msgHash, publicKey);
    if (!isSigned) {
      return res.status(400).send({ message: "Firma no válida" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({
        balance: balances[sender],
      });
    }
  } catch (e) {
    console.error("Error en el servidor: ", e);
    res.status(400).send({ message: "Error interno del servidor" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
