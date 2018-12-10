/* eslint-disable */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, ThemeConsumer } from 'former-kit'
import ReactGA from 'react-ga'

import {
  __,
  always,
  assoc,
  divide,
  equals,
  identity,
  ifElse,
  isNil,
  multiply,
  path,
  pipe,
  prop,
} from 'ramda'

import { NavigationBar } from '../../components'
import {
  addPageInfo,
  updateFinalAmount,
} from '../../redux/actions'
import { formatToBRL } from './../../utils/masks/'
import EmvIcon from '../../images/point-of-service.svg'

const wasm = import('./emv/wasm_grett')

const consumeTheme = ThemeConsumer('UIBoletoPage')

class Emv extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      mustPair: false,
      device: {},
    }
  }

  componentDidMount = () => {
    console.log(wasm)
    wasm.then(r => {
      const test = r.greet("OI")
      console.log('SIUAHSIUAHIUS', test)
    })

    const {
      callbacks,
      transaction,
    } = this.props

    const amount = path([
      'amount',
    ], transaction)

    const discountType = path([
      'paymentConfig',
      'boleto',
      'discount',
      'type',
    ], transaction)

    const discountValue = path([
      'paymentConfig',
      'boleto',
      'discount',
      'value',
    ], transaction)

    const calculatePercentage = pipe(
      divide(__, 100),
      multiply(amount)
    )

    const getFinalDiscount = ifElse(
      equals('percentage'),
      always(calculatePercentage),
      always(identity),
    )

    const finalDiscount = getFinalDiscount(discountType)(discountValue)

    const onEnter = prop('onEnter', callbacks)

    this.handlePair()

    if (onEnter) {
      onEnter()
    }


    ReactGA.pageview('/emv')
  }

  componentWillUnmount () {
    const { callbacks } = this.props
    const onExit = prop('onExit', callbacks)

    if (onExit) {
      onExit()
    }
  }

  getSubtitle = (
    path([
      'paymentConfig',
      'emv',
      'subtitle',
    ])
  )

  handleClick = () => {
    const errors = {}
    const paymentConfig = path(['transaction', 'paymentConfig'], this.props)
    const values = { emv: true }
    const type = 'emv'

    const method = assoc(
      'type',
      type,
      paymentConfig.emv,
    )

    const payment = {
      method,
      type,
      info: {},
    }

    this.props.handlePageChange({
      page: 'payment',
      pageInfo: payment,
    })

    this.props.handleSubmit(values, errors)
  }

  handlePair = () => {
    navigator.usb.getDevices()
      .then(devices => {
        if(devices.length == 0) {
          return this.setState({ mustPair: true })
        }

        this.setState({ 
          mustPair: false,
          device: devices[0],
        })
      })
  }

  handleStartPair = () => {
    navigator.usb.requestDevice({filters: [{ vendorId: 0x1753  }]})
      .then(device => {
        this.setState({
          mustPair: false,
          device,
        })
      })
  }

  render () {
    const {
      enableCart,
      finalAmount,
      handlePreviousButton,
      theme,
      transaction,
    } = this.props
    console.log(this.state.device)
    const subtitle = this.getSubtitle(transaction)

    return (
      <section className={theme.wrapper}>
        <header className={theme.header}>
          <h1 className={theme.title}>Cartão de Crédito</h1>
          {
            subtitle &&
            <h2 className={theme.subtitle}>{ subtitle }</h2>
          }
        </header>
        <div style={{ display: this.state.mustPair ? 'none' : 'flex' }} className={theme.content}>
          <EmvIcon
            width={126}
            height={90}
            fill={this.props.checkoutColors.textColor}
            gradient={{
              initial: this.props.checkoutColors.primaryColor,
              final: this.props.checkoutColors.secondaryColor,
            }}
            className={theme.icon}
          />
          <p className={theme.warning}>
            INSIRA O CARTAO :
          </p>
        </div>

        <div style={{ display: !this.state.mustPair ? 'none' : 'flex' }} className={theme.content}>
          <p className={theme.warning}>
            É necessário sincronizar a maquininha
          </p>
        </div>
            

        <footer className={theme.footer}>
          <NavigationBar
            enableCart={enableCart}
            handlePreviousButton={handlePreviousButton}
            handleNextButton={this.state.mustPair ? this.handleStartPair : null}
            prevTitle="Ops, voltar"
            nextTitle={this.state.mustPair ? "Parear" : null}
          />
        </footer>
      </section>
    )
  }
}


Emv.propTypes = {
  theme: PropTypes.shape({
    amount: PropTypes.string,
    amountTitle: PropTypes.string,
    content: PropTypes.string,
    footer: PropTypes.string,
    header: PropTypes.string,
    icon: PropTypes.string,
    subtitle: PropTypes.string,
    title: PropTypes.string,
    warning: PropTypes.string,
    wrapper: PropTypes.string,
  }).isRequired,
  checkoutColors: PropTypes.shape().isRequired,
  callbacks: PropTypes.shape({
    onEnter: PropTypes.func,
    onExit: PropTypes.func,
  }),
  enableCart: PropTypes.bool,
  finalAmount: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handlePreviousButton: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  transaction: PropTypes.shape({
    amount: PropTypes.number,
    paymentConfig: PropTypes.shape({
      boleto: PropTypes.shape({
        subtitle: PropTypes.string,
        discount: PropTypes.shape({
          type: PropTypes.string,
          value: PropTypes.number,
        }),
      }),
    }),
    paymentMethods: PropTypes.arrayOf(PropTypes.array),
  }).isRequired,
}

Emv.defaultProps = {
  enableCart: false,
  callbacks: {},
}

const mapStateToProps = ({ transactionValues }) => ({
  finalAmount: transactionValues.finalAmount,
})

const mapDispatchToProps = {
  handlePageChange: addPageInfo,
}

export default
connect(mapStateToProps, mapDispatchToProps)(consumeTheme(Emv))
