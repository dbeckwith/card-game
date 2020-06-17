class Player(object):
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.connected = False
        self.hand = []
        self.in_hand = False

    def __json__(self):
        return {
            'id': self.id,
            'name': self.name,
            'connected': self.connected,
            'hand': self.hand,
            'in_hand': self.in_hand,
        }

    def new_game(self):
        self.hand = []
        self.in_hand = True

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
