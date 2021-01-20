function _expectThrewEvent(dispatchEventMock, eventType) {
  for (const call of dispatchEventMock.calls) {
    if (call[0].type == eventType) {
      return true;
    }
  }

  throw `${eventType} expected but not dispatched`;
}

function _expectDidntThrowEvent(dispatchEventMock, eventType) {
  for (const call of dispatchEventMock.calls) {
    if (call[0].type == eventType) {
      throw `${eventType} dispatched but not expected`;
    }
  }

  return true;
}

export { _expectThrewEvent, _expectDidntThrowEvent }