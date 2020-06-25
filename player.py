__author__ = 'D. Beckwith'

class Player(object):
    def __init__(self, id, name):
        self.id         = id
        self.name       = name
        self.connected  = False
        self.hand       = []
        self.in_hand    = False
        self.chips      = 0
        self.buy_in     = 0
        self.chips_in   = 0 # how much bet in round for this player

    def __json__(self):
        '''returns: JSON of all player fields'''
        return {
            'id'        : self.id,
            'name'      : self.name,
            'connected' : self.connected,
            'hand'      : self.hand,
            'in_hand'   : self.in_hand,
            'chips'     : self.chips,
            'buy_in'    : self.buy_in,
            'chips_in'  : self.chips_in,
        }

    def new_game(self):
        '''reset player's hand nad put them in game'''
        self.hand = []
        self.in_hand = True
        self.chips_in = 0

    def give_card(self, card):
        '''deal one card'''
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
