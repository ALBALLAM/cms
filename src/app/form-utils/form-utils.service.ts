import {Injectable} from '@angular/core';

declare var $: any;

@Injectable()

export class FormUtilsService {

  manageFields(tempBlock): any[] {
    var currentGroupFields = [], currentGroup = '';
    var x = 0, fieldsLength = tempBlock.length;
    var isRequired = false;

    while (x < tempBlock.length) {
      if (currentGroup != '' && (tempBlock[x]['field_group'] == undefined || tempBlock[x]['field_group'] != currentGroup)) {
        tempBlock.splice(x - currentGroupFields.length, currentGroupFields.length, {
          'type': 'fields-group',
          'identifier': currentGroup,
          'fields': currentGroupFields,
          'order': x - currentGroupFields.length,
          'required': isRequired
        });
        x = x - currentGroupFields.length + 1;
        currentGroup = '';
        currentGroupFields = [];
      }

      if (tempBlock[x]['field_group'] != undefined && tempBlock[x]['type'] != 'title') {
        currentGroup = tempBlock[x]['field_group'];
        currentGroupFields.push(tempBlock[x]);
        if (tempBlock[x]['required'] && !tempBlock[x]['hidden']) isRequired = true;
      }

      if (x == tempBlock.length - 1 && currentGroup != '' && tempBlock[x]['field_group'] == currentGroup) {
        tempBlock.splice(x - currentGroupFields.length + 1, currentGroupFields.length, {
          'type': 'fields-group',
          'identifier': currentGroup,
          'fields': currentGroupFields,
          'order': x - currentGroupFields.length + 1,
          'required': isRequired
        });
        x = x - currentGroupFields.length + 1;
        currentGroup = '';
        currentGroupFields = [];
      }
      tempBlock[x]['order'] = x;
      x++;
    }
    return tempBlock;
  }

  getGroupFields(blockObj): any {
    let params = {};
    let grpParams, tempParam;

    if (params[blockObj.id] === undefined) {
      params[blockObj.id] = {};
    }

    for (let j = 0; j < blockObj.fields.length; j++) {
      if (blockObj.fields[j]['type'] === 'title' || blockObj.fields[j].readonly || blockObj.fields[j].hidden) continue;
      if (blockObj.fields[j]['type'] === 'fields-group') {
        grpParams = [];
        for (let val of blockObj.fields[j]['value'])
          grpParams.push(val);
        let newGrpParam = this.getNewGroupBox(blockObj.fields[j]);

        if (newGrpParam.grpValid) {
          if (Object.keys(newGrpParam.tempFldParam).length !== 0) {
            grpParams.push(newGrpParam.tempFldParam);
          }
        } else if (!newGrpParam.allEmpty) {
        }
        params[blockObj.id][blockObj.fields[j].identifier] = grpParams;
      } else {
        params[blockObj.id][blockObj.fields[j].identifier] = blockObj.fields[j].value;
        // if (blockObj.fields[j]['type'] == 'date' && blockObj.fields[j].value.length > 0) {
        // 	let valDate = new Date();
        // 	let dateObjs = blockObj.fields[j].value.split('/');
        // 	if (dateObjs.length == 3) {
        // 		valDate.setFullYear(parseInt(dateObjs[2]));
        // 		valDate.setMonth(parseInt(dateObjs[1]) - 1);
        // 		valDate.setDate(parseInt(dateObjs[0]));
        // 	}
        // 	params[blockObj.id][blockObj.fields[j].identifier] = valDate;
        // } else
        if (blockObj.fields[j]['type'] == 'phone_number') {
          let fieldValue = blockObj.fields[j]['value'];
          /*fieldValue = fieldValue.replace('+','');
                     fieldValue = fieldValue.replace(/-/g,'');
                     fieldValue = fieldValue.replace(/_/g,'');*/
          params[blockObj.id][blockObj.fields[j].identifier] = fieldValue;
        } else if (blockObj.fields[j]['type'] == 'toggle') {
          let fieldValue;
          if (blockObj.fields[j]['value'] == 1 || blockObj.fields[j]['value'] == true || blockObj.fields[j]['value'] == 'yes' || blockObj.fields[j]['value'] == 'Yes') {
            fieldValue = true;
          } else {
            fieldValue = false;
          }
          params[blockObj.id][blockObj.fields[j].identifier] = fieldValue;
        } else if (blockObj.fields[j]['type'] === 'multi-select') {
          if (!blockObj.fields[j].value || !Array.isArray(blockObj.fields[j].value)) {
            params[blockObj.id][blockObj.fields[j].identifier] = [];
          }
        }
      }

    }

    return params[blockObj.id];
  }

  getReviewFields(outerBlocks, key): any {
    var params = {};
    var grpParams, tempParam;

    for (var i = 0; i < outerBlocks.length; i++) {
      var identity = '';
      if (params[outerBlocks[i][identity]] === undefined) {
        params[(outerBlocks[i].id).split('_')[0] + key] = {};
      }
      identity = (outerBlocks[i].id).split('_')[0] + key;
      params[identity] = this.getFields(outerBlocks[i].blocks);
    }
    return params;
  }

  getFields(blocks): any {
    var params = {};
    for (var i = 0; i < blocks.length; i++) {
      params[blocks[i].id] = this.getGroupFields(blocks[i]);
    }
    return params;
  }

  addGroupDependencies(grpFields, businessRulesObj): void {
    for (var x = 0; x < grpFields.length; x++) {
      if (businessRulesObj[grpFields[x].identifier])
        grpFields[x].dependencies = businessRulesObj[grpFields[x].identifier];
    }
  }

  addDependencies(blocks, savedData, businessRulesObj): void {
    for (var i = 0; i < blocks.length; i++) {
      var blockValues = savedData && savedData[blocks[i].id] ? savedData[blocks[i].id] : {};

      blocks[i]['fieldsOrder'] = {};

      if (Object.keys(blockValues).length > 0) {
        blocks[i].visited = true;
      } else blocks[i].visited = false;
      for (var x = 0; x < blocks[i].fields.length; x++) {
        //load saved data
        blocks[i].fields[x]['value'] = blockValues[blocks[i].fields[x].identifier] ? blockValues[blocks[i].fields[x].identifier] : '';
        if (blocks[i].fields[x]['type'] == 'number') {
          blocks[i].fields[x]['value'] = Math.round(blockValues[blocks[i].fields[x].identifier] * 100) / 100;
        }
        if (blocks[i].fields[x]['type'] == 'date' && blocks[i].fields[x]['value'].length > 0) {
          let valDate = new Date(blocks[i].fields[x]['value']);
          blocks[i].fields[x]['value'] = valDate.getDate() + '/' + (valDate.getMonth() + 1) + '/' + valDate.getFullYear();
        }
        if (blocks[i].fields[x]['value'] != '') blocks[i].fields[x]['hidden'] = false;
        if (!blocks[i].fields[x]['readonly']) blocks[i].fields[x]['readonly'] = false;
        blocks[i]['fieldsOrder'][blocks[i].fields[x].identifier] = blocks[i].fields[x].order;

        if (blocks[i].fields[x]['type'] == 'fields-group') {
          this.addGroupDependencies(blocks[i].fields[x]['fields'], businessRulesObj);
        }
        else {
          if (businessRulesObj[blocks[i].fields[x].identifier])
            blocks[i].fields[x].dependencies = businessRulesObj[blocks[i].fields[x].identifier];
        }
      }
    }
  }

  sortFields(blocks, blocksTemp): void {
    for (let key in blocksTemp) {
      let order = blocksTemp[key]['order'] ? blocksTemp[key]['order'] : 0;
      blocks[order] = blocksTemp[key];
      blocks[order]['id'] = key;
      blocks[order]['valid'] = false;

      //Sort the fields array by order and remove unassigned indexes;
      let fieldTemp = [];
      for (var i = 0; i < blocks[order]['fields'].length; i++) {
        if (blocks[order]['fields'][i].value == undefined) {
          blocks[order]['fields'][i].value = '';
        }
        while (fieldTemp[blocks[order]['fields'][i]['order']] != undefined)
          blocks[order]['fields'][i]['order'] = blocks[order]['fields'][i]['order'] + 1;
        fieldTemp[blocks[order]['fields'][i]['order']] = blocks[order]['fields'][i];
      }
      for (var i = 0; i < fieldTemp.length; i++) {
        if (fieldTemp[i] == undefined) {
          fieldTemp.splice(i, 1);
          i--;
          continue;
        }
        fieldTemp[i]['order'] = i;
      }
      blocks[order]['fields'] = [];
      for (var i = 0; i < fieldTemp.length; i++) {
        blocks[order]['fields'].push(fieldTemp[i]);
      }
      //End sorting
      if (blocks[order]['dependent_fields'] != undefined) {
        var temp = [];
        Object.keys(blocks[order]['dependent_fields']).map((key) => {
          temp.push(
            {
              'id': key,
              'hidden': false,
              'fields': blocks[order]['dependent_fields'][key]['fields']
            });
        });
      }
    }
  }

  isBlockChanged(block): boolean {
    if (!block/* || block['hidden']*/) {
      return false;
    }
    var changed = false;

    //check if block changed
    for (let field of block.fields) {
      if (field.hidden) {
        continue;
      }
      if (field.change || field.changed) {
        changed = true;
        break;
      } else if (field.type == 'fields-group') {
//				let grpParams = this.getGroupBoxes(field);
        let newGrpParam = this.getNewGroupBox(field);
        if (newGrpParam.grpValid) {
          if (Object.keys(newGrpParam.tempFldParam).length !== 0) {
//						grpParams.push(newGrpParam.tempFldParam);
            changed = true;
          }
        }
//				if (grpParams.length != field.value.length) changed = true;
      }
    }
    return changed;
  }

  getGroupBoxes(field): any {
    let grpParams = [];
    var groups = $('.' + field['identifier'] + '.grp-box');
    var zBlocks = field['fields'];
    groups.each(function (index) {
      var tempParam = {};
      for (var x = 0; x < zBlocks.length; x++) {
        if (zBlocks[x]['type'] == 'title') continue;
        if ($(this).find('.grp-field.' + zBlocks[x].identifier + ' .grp-field-value').length > 0) {
          if (zBlocks[x].type == 'number') {
            let fieldValue = $(this).find('.grp-field.' + zBlocks[x].identifier + ' .grp-field-value').text();
            fieldValue = fieldValue.replace(/,/g, '');
            tempParam[zBlocks[x].identifier] = fieldValue;
          } else if (zBlocks[x].type == 'phone_number') {
            let fieldValue = $(this).find('.grp-field.' + zBlocks[x].identifier + ' .grp-field-value').text();
            fieldValue = fieldValue.replace('+', '');
            fieldValue = fieldValue.replace(/-/g, '');
            fieldValue = fieldValue.replace(/_/g, '');
            tempParam[zBlocks[x].identifier] = fieldValue;
          } else {
            tempParam[zBlocks[x].identifier] = $(this).find('.grp-field.' + zBlocks[x].identifier + ' .grp-field-value').text();
          }
        }
      }
      grpParams.push(tempParam);
    });

    return grpParams;
  }

  getNewGroupBox(field): any {
    let grpValid = true;
    let allEmpty = true;
    let tempFldParam = {};

    for (let grpField of field['fields']) {
      if (grpField.type == 'title' || grpField.hidden || grpField.readonly) continue;
      if (grpField.type == 'date') {
        if (grpField.required && (grpField.value == '' || grpField.value == null)) {
          grpValid = false;
        }
        if (grpField.value && grpField.value.length > 0) {
          tempFldParam[grpField.identifier] = grpField.value;
          allEmpty = false;
        }
      }
      else if (grpField.type == 'checkbox') {
        if (grpField.required && grpField.value == '') {
          grpValid = false;
        }
        else {
          tempFldParam[grpField.identifier] = grpField.value;
          allEmpty = false;
        }
      }
      else if (grpField.type == 'dropdown' || grpField.type == 'multi-select') {
        if (grpField.value && grpField.value.length > 0) {
          tempFldParam[grpField.identifier] = grpField.value;
          allEmpty = false;
        }
        if (grpField.required && grpField.value == '') {
          grpValid = false;
        }
      }
      else {
        let valid = grpField.group.controls[grpField.identifier].valid;
        if (!valid) {
          grpValid = false;
        } else if (grpField.value && grpField.value.length > 0) {
          tempFldParam[grpField.identifier] = grpField.value;
          allEmpty = false;
        }
      }
    }

    return {'grpValid': grpValid, 'allEmpty': allEmpty, 'tempFldParam': tempFldParam};
  }

  getGroupBoxValidation(field): boolean {
    let grpValid = true;
    for (let grpField of field['fields']) {
      if (grpField.type == 'title' || grpField.readonly || grpField.hidden) continue;
      if (grpField.type == 'date') {
        if (grpField.required && (grpField.value == '' || grpField.value == null)) {
          grpValid = false;
        }
      }
      else if (grpField.type == 'checkbox') {
        if (grpField.required && grpField.value == '') {
          grpValid = false;
        }
      }
      else if (grpField.type == 'dropdown' || grpField.type == 'multi-select') {
        if (grpField.required && grpField.value == '') {
          grpValid = false;
        }
      }
      else {
        if (grpField.required && grpField.value == '') {
          grpValid = false;
        }
      }
    }
    return grpValid;
  }
}
