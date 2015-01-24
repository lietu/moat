class Message(object):
    def __init__(self, game, player_id, data):
        self.game = game
        self.player_id = player_id

        for key in data:
            setattr(self, key, data[key])

        self.validate()

    def validate(self):
        raise NotImplementedError("Message without validation")

    def process(self):
        raise NotImplementedError("Message without processing")


class ShootMessage(Message):
    def __init__(self, game, player_id, data):
        self.x = 0
        self.y = 0

        super(ShootMessage, self).__init__(game, player_id, data)

    def validate(self):
        if not self.x >= 0 and self.x <= 640:
            raise ValueError("Invalid X position")
        if not self.y >= 0 and self.y <= 480:
            raise ValueError("Invalid Y position")

    def process(self):
        self.game.shoot(self.player_id, (self.x, self.y,))


class RequestRespawn(Message):
    def __init__(self, game, player_id, data):
        super(RequestRespawn, self).__init__(game, player_id, data)

    def validate(self):
        pass

    def process(self):
        self.game.request_respawn(self.player_id)


MESSAGE_TYPES = {
    "shoot": ShootMessage,
    "requestRespawn": RequestRespawn
}
