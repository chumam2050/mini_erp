import { Edit3, Trash2, UserPlus } from 'lucide-react'
import { Button } from './ui/button'

function ActionButtons({ onChangeQty, onClearAll, onInputMember }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button 
        onClick={onChangeQty}
        variant="outline"
        className="h-24 flex-col gap-2 text-sm font-semibold hover:bg-accent"
      >
        <Edit3 className="h-6 w-6" />
        <div className="text-center leading-tight">
          UBAH QTY<br />(+/-)
        </div>
      </Button>
      <Button 
        onClick={onInputMember}
        variant="outline"
        className="h-24 flex-col gap-2 text-sm font-semibold hover:bg-accent"
      >
        <UserPlus className="h-6 w-6" />
        <div className="text-center leading-tight">
          INPUT<br />MEMBER
        </div>
      </Button>
      <Button 
        onClick={onClearAll}
        variant="destructive"
        className="h-24 flex-col gap-2 text-sm font-semibold"
      >
        <Trash2 className="h-6 w-6" />
        <div className="text-center leading-tight">
          CLEAR ALL<br />(Hapus Semua)
        </div>
      </Button>
    </div>
  )
}

export default ActionButtons
