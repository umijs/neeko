import { model } from 'okeen'

export enum Colors {
  green = 'green',
  black = 'black',
  white = 'white',
  blue = 'blue',
}

const color = model({
  state: {
    currentColor: Colors.green,
  },
  watch: {
    currentColor() {
      console.log("wow! I'm neeko")
    },
  },
})

export default color
