import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Profesor } from '../../profesor/profesor.entity';
import { Club} from '../../club/entities/club.entity'
@Entity()
export class Clase {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Profesor)
    @JoinColumn({ name: 'profesorId'})
    profesor: Profesor;

    @ManyToOne(() => Club)
    @JoinColumn({ name: 'clubId'})
    club: Club;

}
