from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
import base64
import json

TYPE_BOOL = 'b'
TYPE_VALUE = 'v'

class Action:
    targetId : str = None
    value = None
    type : str

    def __init__(self, id: str, value, type: str) -> None:
        self.targetId = id
        self.value = value
        self.type = type


def generateUrl(shopUrl: str, listAction: list, keyPassword: str = None) -> str:
    data = {}

    action: Action
    for action in listAction:
        if(action.type == TYPE_VALUE):
            data[action.targetId] = action.type + str(action.value)
        else: # Checkmarks:
            data[action.targetId] = action.type + ("1" if action.value else "0")

    print(json.dumps(data))
    data = base64.urlsafe_b64encode(json.dumps(data).encode("utf-8"))
    print(data)

    with open('priv-key.rsa', 'r') as f:
        k = RSA.importKey(f.read(),  passphrase=keyPassword)

    hash = SHA256.new(data)
    signature = base64.urlsafe_b64encode(pkcs1_15.new(k).sign(hash)) #sign is made with the b64 of the json!
    
    signature = signature.decode("utf-8").replace("=", "")
    data = data.decode("utf-8").replace("=", "")

    return f"{shopUrl}#a={data}&s={signature}"




l = []
l.append(Action("test", "asd", TYPE_VALUE))
l.append(Action("kek", True, TYPE_BOOL))

shopUrl = "http://localhost:8000/suka/testPayment/"

url = generateUrl(shopUrl, l)
print(url)