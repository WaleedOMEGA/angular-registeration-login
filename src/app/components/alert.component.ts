
import { Component, Input } from '@angular/core';
import { Alert, AlertType } from '../models/alert';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'alert',
  templateUrl: 'alert.component.html'
})
export class AlertComponent{
  alerts: Alert[] = [];
  @Input() fade = true;
  cssClass(alert: Alert): string |undefined{
    if (!alert) { return ''; }

    const classes = ['alert', 'alert-dismissable', 'mt-4', 'container'];

    const alertTypeClass = {
        [AlertType.Success]: 'alert alert-success',
        [AlertType.Error]: 'alert alert-danger',
        [AlertType.Info]: 'alert alert-info',
        [AlertType.Warning]: 'alert alert-warning'
    };
    alert.type != null ?
    classes.push(alertTypeClass[alert.type]) : classes.push('');

    if (alert.fade) {
        classes.push('fade');
    }

    return classes.join(' ');
}

removeAlert(alert: Alert): void {
  // check if already removed to prevent error on auto close
  if (!this.alerts.includes(alert)) { return; }

  if (this.fade) {
      // fade out alert
      alert.fade = true;

      // remove alert after faded out
      setTimeout(() => {
          this.alerts = this.alerts.filter(x => x !== alert);
      }, 250);
  } else {
      // remove alert
      this.alerts = this.alerts.filter(x => x !== alert);
  }
}
}
