const CreateMetafieldDefinition = `mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      id
      name
      namespace
      key
      type {
        name
      }
      ownerType
    }
    userErrors {
      field
      message
    }
  }
}`;

export default CreateMetafieldDefinition; 