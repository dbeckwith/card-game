__author__ = 'D. Beckwith'

class Player(object):
    def __init__(self, id, name):
        self.id         = id
        self.name       = name
        self.connected  = False
        self.hand       = []
        self.in_hand    = False
        self.chips      = 0 # how much they currently have, total
        self.buy_in     = 0 # how many chips they have bought over the course of the night
        self.chips_in   = 0 # how much bet in round for this player
        self.anted      = False
        self.chips_in_hand = 0
        self.last_ante  = 0
        self.last_bet   = 0
        self.ante_is_last_bet =  None
        
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
            'anted'     : self.anted,
            'chips_in_hand': self.chips_in_hand,
            'last_ante' : self.last_ante,
            'last_bet'  : self.last_bet,
            'ante_is_last_bet' : self.ante_is_last_bet,
        }

    def new_game(self):
        '''reset player's hand and put them in game'''
        self.hand = []
        self.in_hand = True
        self.chips_in = 0
        self.chips_in_hand = 0
        self.anted = False
        self.last_ante  = 0
        self.last_bet   = 0        
        self.ante_is_last_bet =  None

    def clear_hand(self):
        self.hand = []
    
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
