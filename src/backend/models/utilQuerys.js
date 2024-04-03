const { supabase } = require('../config/supabase.js');

/*---------------------------------------------
Select sintaxe example:
    .from('users')
    .select('*')
    .eq('id', 1);
---------------------------------------------*/
const selectRow = async (table, field, where_column, where_value) => {
    try {
      const { data: response, error } = await supabase
        .from(table)
        .select(field)
        .eq(where_column, where_value);
         
      if (error) {
        throw error;
      }
      return response;

    } catch (error) {
        console.error('Erro na consulta de usuário:', error.message);
    }
}

/*---------------------------------------------
Update sintaxe example:
    .from('users')
    .update({ other_column: 'otherValue' })
    .eq('some_column', 'someValue')
    .select()
---------------------------------------------*/
const updateRow = async (table, set, where_column, where_value) => {
  try {
    const { error } = await supabase
      .from(table)
      .update(set)
      .eq(where_column, where_value)
      .select();
      
    if (error) {
      throw error;
    }
  } catch (error) {
      console.error('Erro na consulta de usuário:', error.message);
  }
}

/*---------------------------------------------
Insert sintaxe example:
    .from('countries')
    .insert({ id: 1, name: 'Denmark' })
---------------------------------------------*/
const insertRow = async (table, insert) => {
  try {
    const { error } = await supabase
      .from(table)
      .insert(insert);
      
    if (error) {
      throw error;
    }
  } catch (error) {
      console.error('Erro na consulta de usuário:', error.message);
  }
}

/*---------------------------------------------
Delete sintaxe example:
    .from('users')
    .delete()
    .eq('some_column', 'someValue')
---------------------------------------------*/
const deleteRow = async (table, where_column, where_value) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(where_column, where_value);
      
    if (error) {
      throw error;
    }
  } catch (error) {
      console.error('Erro na consulta de usuário:', error.message);
  }
}

/*---------------------------------------------
Select sintaxe example:
    .from('users')
    .select('*')
    .match({
      status: 1,
      name: 'Eduardo'
    });
---------------------------------------------*/
const selectConditions = async (table, field, where_conditions, column_like, like, order_field, order_direction) => {
  try {
    const { data: response, error } = await supabase
      .from(table)
      .select(field)
      .match(where_conditions)
      .ilike(column_like, like)
      .order(order_field, { 
        ascending: order_direction === 'asc', 
        descending: order_direction === 'desc' 
      });
       
    if (error) {
      throw error;
    }
    return response;

  } catch (error) {
      console.error('Erro na consulta de usuário:', error.message);
  }
}

/*
Select sintaxe example:
    .from('table1')
    .select('
      table1_selected,
      table2 ( table2_selected, table2_selected ), 

    ')
    .match({
      table1: 26,
      'table2.id': '1'
    });
*/
const selectInnerJoin = async (table, fields_select_table, join_table, fields_select_join, where_conditions, column_like, like, order_field, order_direction) => {
  try {
      const { data, error } = await supabase
          .from(table)
          .select(`
            ${fields_select_table},
            ${join_table} ( ${fields_select_join} )
          `)
          .match(where_conditions)
          .ilike(column_like, like)
          .order(order_field, { 
            ascending: order_direction === 'asc', 
            descending: order_direction === 'desc' 
          });

      if (error) {
          throw error;
      }

      return data;
  
      } catch (error) {
          console.error('Erro na consulta de usuário:', error.message);
      }

}

/*---------------------------------------------
Filters sintaxe by example:
  let { data: response, error } = await supabase
    .from('users')
    .select("*")
    // Filters
    .eq('column', 'Equal to')
    .gt('column', 'Greater than')
    .lt('column', 'Less than')
    .gte('column', 'Greater than or equal to')
    .lte('column', 'Less than or equal to')
    .like('column', '%CaseSensitive%')
    .ilike('column', '%CaseInsensitive%')
    .is('column', null)
    .in('column', ['Array', 'Values'])
    .neq('column', 'Not equal to')
    // Arrays
    .cs('array_column', ['array', 'contains'])
    .cd('array_column', ['contained', 'by'])
---------------------------------------------*/

module.exports = {
  selectRow,
  updateRow,
  deleteRow,
  insertRow,
  selectConditions,
  selectInnerJoin
}