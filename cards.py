import random


values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K']
suits = ['C', 'D', 'H', 'S']

def new_deck(count=1):
    deck = [value + suit for value in values for suit in suits for _ in range(count)]
    random.shuffle(deck)
    return deck
