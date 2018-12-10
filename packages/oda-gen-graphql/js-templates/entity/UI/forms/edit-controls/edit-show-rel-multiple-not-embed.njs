<#@ context "ctx" -#>
<#@ alias 'edit-show-rel-multiple-not-embed' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.edit({uix, source})
<#-} else {-#>
<uix.FormDataConsumer key="resources.#{entity.name}.fields.#{f.name}">
  {({ formData, ...rest }) => (
  <uix.Fragment>
    <uix.ReferenceManyField 
      {...rest}
      label="resources.#{entity.name}.fields.#{f.name}"
      reference="#{!(f.verb==='BelongsToMany' &&  f.ref.using)? f.ref.entity: f.ref.using.entity}"
      filter={{}}
      target="#{f.ref.opposite}"
    >
      <uix.#{!(f.verb==='BelongsToMany' &&  f.ref.using) ? f.ref.entity: f.ref.using.entity}.Grid fields={'!#{f.ref.opposite}'}/>
    </uix.ReferenceManyField>

    <uix.#{!(f.verb==='BelongsToMany' &&  f.ref.using) ? f.ref.entity: f.ref.using.entity}.Add {...rest} target={'#{f.ref.opposite}'} label="resources.#{entity.name}.actions.#{f.field}"/>
  </uix.Fragment>
  )}
</uix.FormDataConsumer>
<#-}-#>