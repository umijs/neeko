// testOnly
// 用于测试组件的时候计数

let count = 0

export function rerenderCallback() {
  count++
}

export function getRerenderCountByComponent() {
  return count
}

export function resetRerenderCount() {
  count = 0
}
