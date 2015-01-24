import json
import uuid
import sockjs.tornado
from time import time
from moat.game import Game
from moat.messages import MESSAGE_TYPES


game = Game()
last_time = None


class GameConnection(sockjs.tornado.SockJSConnection):
    players = set()

    def __init__(self, *args, **kwargs):
        super(GameConnection, self).__init__(*args, **kwargs)

        self.id = str(uuid.uuid4())

    def on_open(self, info):
        self.players.add(self)
        data = {"playerId": self.id}
        self.send(json.dumps([data]))
        game.add_player(self.id)
        self.send(json.dumps(game.get_all_objects()))

    def _push_message(self, message):
        data = json.dumps([message])
        self.broadcast(self.players, data)

    def on_message(self, message):
        data = json.loads(message)

        if data["type"] not in MESSAGE_TYPES:
            raise ValueError("Unknown message type {}".format(data["type"]))

        msg = MESSAGE_TYPES[data["type"]](game, self.id, data)
        msg.process()

    def on_close(self):
        self.players.remove(self)
        game.remove(self.id)


def get_time():
    return time() * 1000


def main_loop():
    global last_time

    start = get_time()
    if not last_time:
        last_time = start

    elapsed = start - last_time
    game.tick(elapsed)
    messages = game.get_messages()

    try:
        player = next(iter(GameConnection.players))
    except StopIteration:
        player = None

    if messages and player:
        data = json.dumps(messages)
        player.broadcast(GameConnection.players, data)

    last_time = get_time()