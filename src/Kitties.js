import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'
import KittyCards from './KittyCards'

import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

// function ShowTheObject(obj){
//   var des = "";
//     for(var name in obj){
// 	des += name + ":" + obj[name] + ";";
//      }
//   console.log(des);
// }



export default function Main (props) {
  const { api, currentAccount } = useSubstrateState()
  const [status, setStatus] = useState('')
  let [allKitties, setAllKitties] = useState([])

  useEffect(() => {
    let unsubscribe
    api.query.kitties
      .kitties.entries(values => {
        console.log({values})
        let kitty
        values.forEach(async ([key, exposure]) => {
          const id = parseInt(key.args.map(k => k.toHuman())[0])
          const owner = await api.query.kitties.kittyOwner(id)
          kitty = {dna: exposure.unwrap(), id, owner: owner.unwrap().toHuman()}
          allKitties.push(kitty)
          console.log('push one kitty.')
        })
        setAllKitties(allKitties)
        console.log('all kittyies: ', allKitties)
      }).then(unsub => {
        unsubscribe = unsub
      }).catch(console.error)
      return () => unsubscribe && unsubscribe()
  }, [api.query.kitties, status, allKitties])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={allKitties} accountPair={currentAccount} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          label='创建' type='SIGNED-TX'
          setStatus={setStatus}
          attrs={{
            palletRpc: 'kitties',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>

}
