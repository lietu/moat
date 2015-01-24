import math
import uuid
from random import randint


class Expired(Exception):
    pass


class Actor(object):
    def __init__(self, game, id):
        self.game = game
        self.id = id
        self.x = 0
        self.y = 0
        self.width = 0
        self.height = 0
        self.rotation = 0

    def get_data(self):
        return {
            "id": self.id,
            "class": self.__class__.__name__,
            "x": self.x,
            "y": self.y,
            "rotation": self.rotation
        }

    def get_coords(self):
        return self.x, self.y

    def check_collisions(self, types):
        for id in self.game.objects:
            item = self.game.objects[id]

            if item.__class__ in types:
                if self.is_colliding(item):
                    return item

        return None

    def is_colliding(self, other):
        return ((abs(self.x - other.x) * 2 < (self.width + other.width)) and
                (abs(self.y - other.y) * 2 < (self.height + other.height)))

    def update(self, time_elapsed):
        pass


class Player(Actor):
    def __init__(self, game, id):
        super(Player, self).__init__(game, id)

        self.x = randint(20, 620)
        self.y = randint(20, 460)

        self.width = 32
        self.height = 32

        self.alive = True

    def update(self, time_elapsed):
        if not self.alive:
            raise Expired()

        return False

    def die(self):
        self.alive = False


class Bullet(Actor):
    def __init__(self, game, owner, origin, target):
        id = str(uuid.uuid4())

        super(Bullet, self).__init__(game, id)

        self.owner = owner
        self.origin = origin
        self.target = target
        self.width = 16
        self.height = 16

        self.distance = (
            self.target[0] - self.origin[0],
            self.target[1] - self.origin[1]
        )
        self.norm = math.sqrt(
            self.distance[0] ** 2.0 + self.distance[1] ** 2.0
        )
        self.direction = (
            self.distance[0] / self.norm,
            self.distance[1] / self.norm
        )

        self.x, self.y = origin

        self.velocity = 400

    def get_data(self):
        data = super(Bullet, self).get_data()
        data["direction"] = self.direction
        data["velocity"] = self.velocity

        return data

    def update(self, time_elapsed):
        speed = self.velocity * (time_elapsed / 1000.0)

        velocity = (self.direction[0] * speed, self.direction[1] * speed)
        self.x += velocity[0]
        self.y += velocity[1]

        if self.x < 0 or self.x > 640:
            raise Expired()
        if self.y < 0 or self.y > 480:
            raise Expired()

        hit_player = self.check_collisions((Player,))
        if hit_player and hit_player != self.owner:
            hit_player.die()
            raise Expired()

        return True


class Game(object):
    def __init__(self):
        self.messages = []
        self.objects = {}

    def add_player(self, id):
        player = Player(self, id)
        self.objects[id] = player
        self.messages.append(player.get_data())

    def remove(self, id):
        if id in self.objects:
            del self.objects[id]
            self.messages.append({
                "id": id,
                "deleted": True
            })

    def tick(self, time_elapsed):
        remove = []

        for id in self.objects:
            item = self.objects[id]

            try:
                if item.update(time_elapsed):
                    data = item.get_data()
                    if not data:
                        raise RuntimeError("No data from {}.get_data()".format(
                            item.__class__.__name__
                        ))
                    self.messages.append(data)
            except Expired:
                remove.append(id)

        for id in remove:
            self.remove(id)

    def shoot(self, player_id, target):
        if player_id not in self.objects:
            return

        player = self.objects[player_id]
        bullet = Bullet(self, player, player.get_coords(), target)
        self.objects[bullet.id] = bullet
        self.messages.append(bullet.get_data())

    def request_respawn(self, player_id):
        if player_id not in self.objects:
            self.add_player(player_id)

    def get_all_objects(self):
        messages = []
        for id in self.objects:
            messages.append(self.objects[id].get_data())

        return messages

    def get_messages(self):
        messages, self.messages = self.messages, []
        return messages
