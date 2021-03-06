import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { Subscription } from '../Subscription';
import { subscribeToPromise } from '../util/subscribeToPromise';

export function fromPromise<T>(input: PromiseLike<T>, scheduler?: IScheduler) {
  if (!scheduler) {
    return new Observable<T>(subscribeToPromise(input));
  } else {
    return new Observable<T>(subscriber => {
      const sub = new Subscription();
      sub.add(scheduler.schedule(() => input.then(
        value => {
          sub.add(scheduler.schedule(() => {
            subscriber.next(value);
            sub.add(scheduler.schedule(() => subscriber.complete()));
          }));
        },
        err => {
          sub.add(scheduler.schedule(() => subscriber.error(err)));
        }
      )));
      return sub;
    });
  }
}
