import { SelectorsProvider } from '@grapesjs/react'
import SelectorManagerContent from './SelectorManagerContent'


export const SelectorsManager = () => {
    return (
        <SelectorsProvider>
            {(props) => <SelectorManagerContent {...props}/>}
        </SelectorsProvider>
    )
}