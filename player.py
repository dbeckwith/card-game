class Player(object):
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.connected = True
        self.hand = []

    def __json__(self):
        return {
            'id': self.id,
            'name': self.name,
            'connected': self.connected,
            'hand': self.hand,
        }

    def new_game(self):
        self.hand = []

    def give_card(self, card):
        self.hand.append(card)

class PlayerCard(object):
    def __init__(self, card, up):
        self.card = card
        self.up = up

    def __json__(self):
        return {
            'card': self.card,
            'up': self.up,
        }
