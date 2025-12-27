import { Edit3, Trash2, UserPlus, Weight } from 'lucide-react'
import { Button } from './ui/button'

function ActionButtons({ onChangeQty, onClearAll, onAddPlasticBag }) {
  return (
    <div className="flex flex-row justify-items-center items-center gap-3">
      {/* <Button 
        onClick={() => onAddPlasticBag('small')}
        variant="outline"
        className="h-24 flex-col gap-2 text-sm font-semibold hover:bg-accent"
      >
        <Weight className="h-6 w-6" />
        <div className="text-center leading-tight">
          Kantong Plastik <br /> Kecil
        </div>
      </Button>
        <Button 
        onClick={() => onAddPlasticBag('large')}
        variant="outline"
        className="h-24 flex-col gap-2 text-sm font-semibold hover:bg-accent"
      >
        <Weight className="h-6 w-6" />
        <div className="text-center leading-tight">
          Kantong Plastik <br /> Besar
        </div>
      </Button> */}
      <div className='text-xl font-bold'>Rangkuman</div>
      <Button 
        onClick={onClearAll}
        variant="destructive"
        className="h-10 w-36 ml-auto flex flex-row gap-2 text-sm font-semibold"
      >
        <Trash2 className="h-6 w-6" />
        <div className="text-center leading-tight">
         Hapus Semua
        </div>
      </Button>
    </div>
  )
}

export default ActionButtons
