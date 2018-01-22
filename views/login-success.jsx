const React = require('react')

class HelloMessage extends React.Component {
  render () {
    return (
      <html lang='en'>
        <head>
          <title>Success</title>
        </head>
        <body>
          <div>Hello, {this.props.user.name}!</div>
        </body>
      </html>
    )
  }
}

module.exports = HelloMessage
