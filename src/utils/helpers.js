import {
  CONTAINER,
  INSERTION,
  NOTIFICATION_BASE_CLASS,
  NOTIFICATION_TYPE as NT,
} from './constants';

const getRandomId = () => Math.random().toString(36).substr(2, 9);
const isNull = (object) => object === null || object === undefined;

export function isBottomContainer(container) {
  return container === CONTAINER.BOTTOM_LEFT
    || container === CONTAINER.BOTTOM_RIGHT
    || container === CONTAINER.BOTTOM_CENTER;
}

export function isTopContainer(container) {
  return container === CONTAINER.TOP_LEFT
    || container === CONTAINER.TOP_RIGHT
    || container === CONTAINER.TOP_CENTER;
}

export function hasFullySwiped(diffX) {
  const swipeLength = Math.abs(diffX);
  const requiredSwipeLength = (40 / 100) * window.innerWidth;
  return swipeLength >= requiredSwipeLength;
}

export function shouldNotificationHaveSliding(notification, count) {
  if (count <= 1) return false;

  return (
    count > 1
    && ((notification.insert === INSERTION.TOP && isTopContainer(notification.container))
    || (notification.insert === INSERTION.BOTTOM && isBottomContainer(notification.container)))
  );
}

export function htmlClassesForExistingType(type) {
  switch (type) {
    case NT.DEFAULT:
      return [NOTIFICATION_BASE_CLASS, 'notification-default'];
    case NT.SUCCESS:
      return [NOTIFICATION_BASE_CLASS, 'notification-success'];
    case NT.DANGER:
      return [NOTIFICATION_BASE_CLASS, 'notification-danger'];
    case NT.WARNING:
      return [NOTIFICATION_BASE_CLASS, 'notification-warning'];
    case NT.INFO:
      return [NOTIFICATION_BASE_CLASS, 'notification-info'];
    default:
      return [NOTIFICATION_BASE_CLASS];
  }
}

export function getHtmlClassesForType({ type, content, userDefinedTypes }) {
  const base = [NOTIFICATION_BASE_CLASS];
  if (content) return base;

  if (isNull(userDefinedTypes)) {
    return htmlClassesForExistingType(type);
  }

  const foundType = userDefinedTypes.find(q => q.name === type);
  return base.concat(foundType.htmlClasses);
}

export function getNotificationsForMobileView(notifications) {
  const top = [];
  const bottom = [];

  notifications.forEach((notification) => {
    const { container } = notification;
    if (isTopContainer(container)) {
      top.push(notification);
    } else if (isBottomContainer(container)) {
      bottom.push(notification);
    }
  });

  return { top, bottom };
}

export function getNotificationsForEachContainer(notifications) {
  const topLeft = [];
  const topRight = [];
  const topCenter = [];
  const bottomLeft = [];
  const bottomRight = [];
  const bottomCenter = [];

  notifications.forEach((notification) => {
    const { container } = notification;
    if (container === CONTAINER.TOP_LEFT) {
      topLeft.push(notification);
    } else if (container === CONTAINER.TOP_RIGHT) {
      topRight.push(notification);
    } else if (container === CONTAINER.TOP_CENTER) {
      topCenter.push(notification);
    } else if (container === CONTAINER.BOTTOM_LEFT) {
      bottomLeft.push(notification);
    } else if (container === CONTAINER.BOTTOM_RIGHT) {
      bottomRight.push(notification);
    } else if (container === CONTAINER.BOTTOM_CENTER) {
      bottomCenter.push(notification);
    }
  });

  return {
    topLeft,
    topRight,
    topCenter,
    bottomLeft,
    bottomRight,
    bottomCenter
  };
}

export function getTransition({ duration, timingFunction, delay }, property) {
  return `${duration}ms ${property} ${timingFunction} ${delay}ms`;
}

function defaultTransition(transition, { duration, timingFunction, delay }) {
  const transitionOptions = transition || {};

  if (isNull(transitionOptions.duration)) {
    transitionOptions.duration = duration;
  }

  if (isNull(transitionOptions.timingFunction)) {
    transitionOptions.timingFunction = timingFunction;
  }

  if (isNull(transitionOptions.delay)) {
    transitionOptions.delay = delay;
  }

  return transitionOptions;
}

function defaultDismiss(dismiss) {
  const option = dismiss;
  const defaults = {
    duration: 0,
    click: true,
    touch: true,
    onScreen: false,
    waitForAnimation: false,
    showIcon: false
  };

  if (!option) {
    return defaults;
  }

  Object.keys(defaults).forEach((prop) => {
    if (isNull(option[prop])) {
      option[prop] = defaults[prop];
    }
  });

  return option;
}

function defaultUserDefinedTypes({ content, type }, definedTypes) {
  if (content) return undefined;

  if (
    type === NT.SUCCESS
    || type === NT.DANGER
    || type === NT.INFO
    || type === NT.DEFAULT
    || type === NT.WARNING
    || !definedTypes
  ) return undefined;

  return definedTypes;
}

export function parseNotification(options, userDefinedTypes) {
  const notification = options;
  const {
    id,
    type,
    insert,
    content,
    container,
    animationIn,
    animationOut,
    slidingEnter,
    slidingExit,
    touchRevert,
    touchSlidingExit,
    dismiss,
    width,
    onRemoval
  } = notification;

  notification.id = id || getRandomId();
  notification.type = content ? null : type.toLowerCase();

  if (userDefinedTypes && !content) {
    notification.userDefinedTypes = defaultUserDefinedTypes(notification, userDefinedTypes);
  }

  if (!isNull(width)) {
    notification.width = width;
  }

  notification.container = container.toLowerCase();
  notification.insert = (insert || 'top').toLowerCase();
  notification.dismiss = defaultDismiss(dismiss);
  notification.animationIn = animationIn || [];
  notification.animationOut = animationOut || [];
  notification.onRemoval = onRemoval || (() => {});

  const t = (duration, timingFunction, delay) => ({
    duration,
    timingFunction,
    delay
  });

  notification.slidingEnter = defaultTransition(slidingEnter, t(600, 'linear', 0));
  notification.slidingExit = defaultTransition(slidingExit, t(600, 'linear', 0));
  notification.touchRevert = defaultTransition(touchRevert, t(600, 'linear', 0));

  const touchExit = touchSlidingExit || {};
  const { swipe, fade } = touchExit;
  notification.touchSlidingExit = touchExit;
  notification.touchSlidingExit.swipe = defaultTransition(swipe || {}, t(600, 'linear', 0));
  notification.touchSlidingExit.fade = defaultTransition(fade || {}, t(300, 'linear', 0));

  return notification;
}
