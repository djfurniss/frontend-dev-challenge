import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body style={
        {"backgroundImage": "linear-gradient(to bottom right, #26037C, #000000)", 
        "backgroundRepeat": "no-repeat",
        "backgroundSize": "cover",
        "backgroundAttachment" : "fixed"}}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}