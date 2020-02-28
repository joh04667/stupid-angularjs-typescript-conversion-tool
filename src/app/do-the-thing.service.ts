import { Injectable } from '@angular/core';
// tslint:disable
@Injectable({
  providedIn: 'root'
})
export class DoTheThingService {

  constructor() { }

  public doTheThing(componentName: string, injectArrayString: string, bindingsObj: string, controllerFn: string) {
    let injectArray: string[] = eval(injectArrayString);
    let ctorList = injectArray.map(s => `private ${s}: ${this.mapProviders(s)},${injectArray.length > 3 ? '\n' : ''}\t\t`).join('').trim();

    if (injectArray.length > 3)
      ctorList = '\n\t\t' + ctorList + '\n\t';
    let component;
    let controller;
    let template;
    bindingsObj = bindingsObj.replace('var component =', '');

    component = eval('(' + bindingsObj + ')');
    if(!component) {
      alert('nope');
      throw 'nope';
    }

    let bindings = this.generateBindings(component.bindings);
    let thisContext = '$' + componentName;

    let methodMatcher = new RegExp('\\' + thisContext + '\\.([\\w\\$]+)\\s*=\\s*function\\s*\\((.*)\\)', 'g');

    let convertedCtrl = controllerFn
      .replace(methodMatcher, 'public $1($2): any')
      .replace(new RegExp(this.escapeRegExp(thisContext), 'g'), 'this');

    injectArray.forEach(s => {
      convertedCtrl = convertedCtrl.replace(new RegExp(this.escapeRegExp(' ' + s), 'g'), ' this.' + s)
    });

    let output = `
  import { Component, Input, Output } from 'angular-ts-decorators';
  import * as angular from 'angular';
  // tslint:disable


  @Component({
    selector: '${componentName}',
    template
  })
  export class ${this.pascalCase(componentName)}Component {
      [x: string]: any;
      public static $inject = [${injectArray.map(s => `'${s}'`).join(', ')}];

  ${bindings}
      constructor(${ctorList.substring(0, ctorList.lastIndexOf(','))}) {}

    `;

    return output + convertedCtrl.toString() + '\n}';
  }

  private pascalCase(str): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private escapeRegExp(string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  private mapProviders(providerName): string {
      const map = {
        $state: 'StateService',
        $rootScope: 'ng.IRootScopeService',
        $scope: 'ng.IScope',
        $element: 'ng.IRootElementService',
        reportService: 'ReportService',
        courseSearchFilterService: 'CourseSearchFilterService',
        hideGrades: 'boolean',
        cwEnums: 'EnumsClass',
        isMessagingDisabled: 'boolean'
      }

      const ret = map[providerName];

      if(!!ret)
        return ret;

      if (providerName.toLowerCase().indexOf('service') > -1)
        return this.pascalCase(providerName);

      return 'any';
  }

  private generateBindings(bindings: {[key: string]: '>' | '@' | '&' }): string {
    let ret = '';

    const lookup = {
      '<' : '@Input()',
      '&' : '@Output()',
      '@' : '@Input() // MAKE SURE TO CHECK ALL BINDINGS TO THIS PROPERTY AND ENSURE THEY ARE COMPILED AS STRINGS!'
    }

    const typeLookup = {
      '<' : ': any;',
      '&' : ': (obj?: any) => void;',
      '@' : ': string;'
    }
    for (const iterator in bindings) {
      let decorator = lookup[bindings[iterator]];
      let type = typeLookup[bindings[iterator]];
      ret += '        ' + decorator + '\n        ' + 'public ' +  iterator + type + '\n';
    }

    return ret;
  }
}
