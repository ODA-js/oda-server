<#@ context "ctx" -#>
<#@ alias 'edit-rel-multiple-not-embed' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.edit({uix, source})
<#-} else {-#>
<uix.FormDataConsumer key="resources.#{entity.name}.fields.#{f.name}">
  {({ formData, ...rest }) => (
    <uix.Fragment>
      <uix.ReferenceArrayInput
        {...rest}
        label="resources.#{entity.name}.fields.#{f.name}"
        source={`${source}#{f.source}`}
        filter={{}}
        reference="#{f.ref.entity}"
        <# if (!f.required){#>allowEmpty<#} else {-#> 
        validate={uix.required()}<#}#> 
      >
        <uix.SelectArrayInput 
          options={{ fullWidth: true }}
          optionText={<uix.#{f.ref.entity}.SelectTitle />}
          optionValue="id" 
        />
      </uix.ReferenceArrayInput>
      <uix.#{f.ref.entity}.Add {...rest} target={'#{f.ref.opposite}'} label="resources.#{entity.name}.actions.#{f.field}" />
    </uix.Fragment>
  )}
</uix.FormDataConsumer>
<#-}-#>