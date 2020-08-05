// testOnly
// use for count for react component render

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
