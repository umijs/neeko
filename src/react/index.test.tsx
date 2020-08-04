import * as React from 'react'
import { mount } from 'enzyme'
import '../testing/setupFilesAfterEnv'
import { getRerenderCountByComponent } from '../testing'
import { observer } from './index'
import { model } from '../index'

const store = model({
  state: {
    a: 1,
    b: {
      bb: 1,
    },
  },
  effects: {
    add() {
      this.$update({ a: this.a + 1 })
    },
    changeB() {
      this.$update((state) => {
        state.b.bb = 2
        // 多一行操作覆盖 state.b 已经存在的情况
        state.b.bb = 3
      })
    },
  },
})

const C = observer((props) => {
  const { a } = store
  return <div>{a}</div>
})

describe('react', () => {
  let origin: any
  beforeAll(() => {
    origin = console.error
    console.error = () => null
  })
  afterAll(() => {
    console.error = origin
  })
  it('should return right component render count', () => {
    mount(<C />)
    expect(getRerenderCountByComponent()).toBe(0)
    store.add()
    expect(getRerenderCountByComponent()).toBe(1)
  })
  it('should reset component render count', () => {
    mount(<C />)
    expect(getRerenderCountByComponent()).toBe(0)
  })
  it('should not render if no data in component changed', () => {
    mount(<C />)
    store.changeB()
    expect(getRerenderCountByComponent()).toBe(0)
  })
  it("doesn't work without test env", () => {
    process.env.NODE_ENV = 'development'
    mount(<C />)
    expect(getRerenderCountByComponent()).toBe(0)
    store.add()
    expect(getRerenderCountByComponent()).toBe(0)
    process.env.NODE_ENV = 'test'
  })
})
