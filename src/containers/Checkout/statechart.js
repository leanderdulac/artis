const addressesStates = {
  initial: 'billing',
  states: {
    billing: {
      on: {
        SHIPPING: 'shipping',
      },
    },
    shipping: {
      on: {
        BILLING: 'billing',
      },
    },
  },
}

const paymentStates = {
  initial: 'selection',
  states: {
    selection: {
      on: {
        SINGLE_CREDITCARD: 'singleCreditCard',
        SINGLE_BOLETO: 'singleBoleto',
        CREDITCARD_AND_BOLETO: 'creditCardAndBoleto',
        MULTIPLE_CREDITCARDS: 'multipleCreditCards',
        EMV: 'emv',
      },
    },
    singleCreditCard: {
      on: {
        SELECTION: 'selection',
        TRANSACTION: 'transaction',
      },
    },
    emv: {
      on: {
        SELECTION: 'selection',
        TRANSACTION: 'transaction',
      },
    },
    singleBoleto: {
      on: {
        SELECTION: 'selection',
        TRANSACTION: 'transaction',
      },
    },
    creditCardAndBoleto: {
      on: {
        SELECTION: 'selection',
        TRANSACTION: 'transaction',
      },
    },
    multipleCreditCards: {
      on: {
        SELECTION: 'selection',
        TRANSACTION: 'transaction',
      },
    },
  },
}

const confirmationStates = {
  initial: 'transaction',
  states: {
    transaction: {
      on: {
        TRANSACTION_SUCCESS: 'success',
        TRANSACTION_ANALYSIS: 'analysis',
        TRANSACTION_FAILURE: 'failure',
      },
      onEntry: 'enterLoading',
    },
    success: {},
    analysis: {},
    failure: {},
  },
}

export default {
  initial: 'initialData',
  states: {
    initialData: {
      on: {
        NEXT: {
          customer: {
            actions: ['navigateToPage'],
          },
        },
      },
      onEntry: 'getInitialData',
    },
    saveCreditCard: {
      on: {
        NEXT: 'confirmation',
      },
      onEntry: 'saveCreditCard',
    },
    customer: {
      on: {
        NEXT: {
          addresses: {
            actions: ['navigateToPage'],
          },
        },
      },
    },
    addresses: {
      on: {
        PREV: 'customer',
        NEXT: 'payment',
      },
      ...addressesStates,
    },
    payment: {
      on: {
        PREV: {
          addresses: {
            actions: ['navigateBackToPage'],
          },
        },
        NEXT: 'confirmation',
        SAVE_CREDIT_CARD: 'saveCreditCard',
      },
      onEntry: 'navigateToPage',
      ...paymentStates,
    },
    confirmation: {
      on: {
        PREV: 'payment',
      },
      ...confirmationStates,
    },
  },
}
