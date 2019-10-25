import { Observable } from 'rxjs'

export function createTimeout({ name, duration = 3000, hasError = false, throwError = false }) {
  const p = new Observable(subscriber => {
    setTimeout(() => {
      if (hasError) subscriber.error(`${name} emit error`)
      if (throwError) throw new Error(`${name} has exception`)
      subscriber.next(`${name} success`)
      subscriber.complete()
    }, duration)
  })

  return p
}

export function log(content, startTime) {
  console.log(content, (new Date().getTime() - startTime.getTime()) / 1000)
}

export function messageLog(content, startTime) {
  return `${content}, ${(new Date().getTime() - startTime.getTime()) / 1000}`
}
