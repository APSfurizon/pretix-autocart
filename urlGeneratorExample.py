import base64
import json
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15

TYPE_BOOL = 'b'
TYPE_INPUT = 'i'
TYPE_DROPDOWN = 'd'
TYPE_TEXTAREA = 't'

'''
You can find java prod examples of this url here:
- github.com/APSfurizon/fz-backend/blob/master/application/src/main/java/net/furizon/backend/feature/pretix/ordersworkflow/usecase/GeneratePretixShopLink.java
- github.com/APSfurizon/fz-backend/blob/master/application/src/main/java/net/furizon/backend/infrastructure/pretix/autocart/AutocartAction.java
- github.com/APSfurizon/fz-backend/blob/master/application/src/main/java/net/furizon/backend/infrastructure/pretix/autocart/AutocartActionType.java
- github.com/APSfurizon/fz-backend/blob/master/application/src/main/java/net/furizon/backend/infrastructure/pretix/autocart/AutocartLinkGenerator.java
- github.com/APSfurizon/fz-backend/blob/master/application/src/main/java/net/furizon/backend/infrastructure/configuration/AutocartPrivKeyConfiguration.java
'''


class Action:
    targetId: str = None
    value = None
    type: str

    def __init__(self, id: str, value, type: str) -> None:
        self.targetId = id
        self.value = value
        self.type = type


def generateUrl(shopUrl: str, listAction: list, keyPassword: str = None) -> str:
    data = {}

    action: Action
    for action in listAction:
        if (action.type == TYPE_BOOL):
            data[action.targetId] = action.type + ("1" if action.value else "0")  # checkmarks are encoded as 0 or 1
        else:  # Checkmarks:
            data[action.targetId] = action.type + str(action.value)

    data = base64.urlsafe_b64encode(json.dumps(data).encode("utf-8")).replace(b"=", b"")

    with open('priv-key.rsa', 'r') as f:
        k = RSA.importKey(f.read(), passphrase=keyPassword)

    hash = SHA256.new(data)
    signed = pkcs1_15.new(k).sign(hash)
    # sign is made with the b64 of the json with the final = truncated! Sign has - instead of +, _ instead of / and trailing = truncated
    signature = base64.urlsafe_b64encode(signed)

    signature = signature.decode("utf-8").replace("=", "")
    data = data.decode("utf-8")

    return f"{shopUrl}#a={data}&s={signature}"


list = []
list.append(Action("item_1", 2, TYPE_INPUT))
list.append(Action("cp_$_item_3", 1, TYPE_BOOL))  # Use $ as a SINGLE (only one allowed per time!) wildcard for cart positions
list.append(Action("id_$-question_1", "non bossetti", TYPE_INPUT))
list.append(Action("id_$-question_1", "non bossetti", TYPE_INPUT))
list.append(Action("id_street", "aaaaaaaa", TYPE_TEXTAREA))
list.append(Action("id_country", "US", TYPE_DROPDOWN))
list.append(Action("id_state", "NV", TYPE_DROPDOWN))

shopUrl = "http://localhost:8000/suka/testPayment/"

url = generateUrl(shopUrl, list)
print(url)
