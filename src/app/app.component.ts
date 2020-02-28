import { Component, ViewChild, Input, ElementRef } from '@angular/core';
import { DoTheThingService } from './do-the-thing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  @ViewChild('name') nameInput: ElementRef;
  @ViewChild('injectArray') injectArrayInput: ElementRef;
  @ViewChild('bindings') bindingsInput: ElementRef;
  @ViewChild('controller') controllerInput: ElementRef;
  @ViewChild('dummyInputForCopying') dummyInputForCopyingInput: ElementRef;
  public output: string;
  title = 'TypescriptConverterHelper';

  constructor(private doTheThingService: DoTheThingService) {}
  public doIt(): void {
    let name = this.nameInput.nativeElement.value;
    let $inject = this.injectArrayInput.nativeElement.value || [];
    let bindings = this.bindingsInput.nativeElement.value;
    let controllerFn = this.controllerInput.nativeElement.value;

    let res = this.doTheThingService.doTheThing(name, $inject, bindings, controllerFn);

    this.output = res;

    this.dummyInputForCopyingInput.nativeElement.value = res;
    this.dummyInputForCopyingInput.nativeElement.select();
    document.execCommand('copy');
  }
}
